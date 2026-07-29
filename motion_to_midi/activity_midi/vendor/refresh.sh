#!/bin/bash
# refresh.sh — re-download everything under vendor/ from upstream.
#
# This is the only thing that should ever write to vendor/. Run it when you want to move to a
# newer library or model, having first changed the version numbers below. It is deliberately
# not part of a build: vendor/ is checked in, and the app never fetches any of this at runtime.
#
# The files land byte-identical to upstream, so `./refresh.sh --verify` can re-download into a
# temp dir and diff, which is how you check that nothing here has been hand-edited.
#
#   ./refresh.sh           re-download everything into vendor/
#   ./refresh.sh --verify  download to a temp dir and diff against vendor/, change nothing

set -euo pipefail
cd "$(dirname "$0")"

# ---- pinned versions ------------------------------------------------------------------
WEBGAZER_VERSION="3.5.3"
TASKS_VISION_VERSION="0.10.0"
FACE_MESH_VERSION="0.4.1633559619"
FACE_API_VERSION="1.7.15"
# mediapipe publishes these by model name and float precision rather than a package version
POSE_MODEL="pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
HAND_MODEL="hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
# ---------------------------------------------------------------------------------------

VERIFY=false
[ "${1:-}" = "--verify" ] && VERIFY=true

DEST="."
if [ "$VERIFY" = true ]; then
  DEST="$(mktemp -d)"
  trap 'rm -rf "$DEST"' EXIT
  echo "downloading a fresh copy into $DEST to compare against vendor/"
fi

dl() { # dl <url> <path-under-DEST>
  mkdir -p "$DEST/$(dirname "$2")"
  curl -sSfL "$1" -o "$DEST/$2"
  printf '  %s\n' "$2"
}

JSD="https://cdn.jsdelivr.net/npm"

echo "webgazer $WEBGAZER_VERSION"
dl "$JSD/webgazer@$WEBGAZER_VERSION/dist/webgazer.js" "webgazer/webgazer.js"

# The ESM build jsdelivr generates with +esm, saved as .esm.js rather than .mjs: some machines'
# mimetypes tables do not know .mjs, and a module served as octet-stream is refused outright.
echo "@mediapipe/tasks-vision $TASKS_VISION_VERSION"
dl "$JSD/@mediapipe/tasks-vision@$TASKS_VISION_VERSION/+esm" "mediapipe/tasks-vision/vision_bundle.esm.js"
for f in vision_wasm_internal.js vision_wasm_internal.wasm \
         vision_wasm_nosimd_internal.js vision_wasm_nosimd_internal.wasm; do
  dl "$JSD/@mediapipe/tasks-vision@$TASKS_VISION_VERSION/wasm/$f" "mediapipe/tasks-vision/wasm/$f"
done

# webgazer bundles the FaceMesh javascript itself, so this only needs the assets that bundled
# copy asks for by name through locateFile. package.json is kept purely to record the version.
echo "@mediapipe/face_mesh $FACE_MESH_VERSION"
for f in face_mesh.binarypb face_mesh.js package.json \
         face_mesh_solution_packed_assets.data face_mesh_solution_packed_assets_loader.js \
         face_mesh_solution_simd_wasm_bin.data face_mesh_solution_simd_wasm_bin.js \
         face_mesh_solution_simd_wasm_bin.wasm \
         face_mesh_solution_wasm_bin.js face_mesh_solution_wasm_bin.wasm; do
  dl "$JSD/@mediapipe/face_mesh@$FACE_MESH_VERSION/$f" "mediapipe/face_mesh/$f"
done

echo "@vladmandic/face-api $FACE_API_VERSION"
dl "$JSD/@vladmandic/face-api@$FACE_API_VERSION/dist/face-api.esm.js" "face-api/face-api.esm.js"

# Only the five nets core.js actually loads. face_recognition (6.4M) and face_landmark_68_tiny
# are in the package too but nothing calls them, so they are left out.
echo "face-api weights"
for f in ssd_mobilenetv1_model tiny_face_detector_model face_landmark_68_model \
         face_expression_model age_gender_model; do
  dl "$JSD/@vladmandic/face-api@$FACE_API_VERSION/model/$f-weights_manifest.json" "models/face-api/$f-weights_manifest.json"
  dl "$JSD/@vladmandic/face-api@$FACE_API_VERSION/model/$f.bin" "models/face-api/$f.bin"
done

echo "mediapipe task models"
MPM="https://storage.googleapis.com/mediapipe-models"
dl "$MPM/$POSE_MODEL" "models/mediapipe/pose_landmarker_lite.task"
dl "$MPM/$HAND_MODEL" "models/mediapipe/hand_landmarker.task"

# Google Fonts serves a different stylesheet per user agent; ask as a current Chrome so the
# reply is woff2, then pull each subset down and repoint the urls at the local copies.
echo "Roboto (weight 400, every subset)"
python3 - "$DEST" <<'PY'
import os, re, sys, urllib.request
dest = os.path.join(sys.argv[1], "fonts")
os.makedirs(dest, exist_ok=True)
ua = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"}
css = urllib.request.urlopen(
    urllib.request.Request("https://fonts.googleapis.com/css?family=Roboto", headers=ua)).read().decode()
# every @font-face is introduced by a /* subset */ comment, which names the file
subsets = re.findall(r"/\*\s*([\w-]+)\s*\*/", css)
urls = re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", css)
assert len(subsets) == len(urls), "google fonts css did not parse as expected"
for subset, url in zip(subsets, urls):
    name = "roboto-%s-400.woff2" % subset
    urllib.request.urlretrieve(url, os.path.join(dest, name))
    css = css.replace(url, "./" + name)
    print("  fonts/" + name)
open(os.path.join(dest, "roboto.css"), "w").write(css)
print("  fonts/roboto.css")
PY

if [ "$VERIFY" = true ]; then
  echo
  if diff -r --brief -x refresh.sh -x README.md -x SHA256SUMS . "$DEST"; then
    echo "vendor/ matches upstream exactly."
  else
    echo "vendor/ differs from upstream — see the list above." >&2
    exit 1
  fi
else
  # a record of what is checked in, so a later --verify has something to point at
  find . -type f ! -name SHA256SUMS ! -name refresh.sh ! -name README.md \
    | sort | xargs shasum -a 256 > SHA256SUMS
  echo
  echo "done. $(wc -l < SHA256SUMS | tr -d ' ') files, $(du -sh . | cut -f1) total."
fi
