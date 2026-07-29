# vendor/

Every library, wasm blob, model weight and font the app loads, checked in. The page makes no
network requests at all once it has been served, so it runs with the internet unplugged.

Nothing in `core.js` or `index.html` may point at a CDN. If you add a dependency, add it here
and to `refresh.sh` in the same change.

## What is here

| path | what | version |
| --- | --- | --- |
| `webgazer/` | eye tracker, used by the Gaze model | webgazer 3.5.3 |
| `mediapipe/tasks-vision/` | Pose and Hand landmarkers — ESM bundle plus the wasm fileset | @mediapipe/tasks-vision 0.10.0 |
| `mediapipe/face_mesh/` | FaceMesh runtime assets webgazer loads through `faceMeshSolutionPath` | @mediapipe/face_mesh 0.4.1633559619 |
| `face-api/` | face detection, expression and age/gender, used by the Face model | @vladmandic/face-api 1.7.15 |
| `models/mediapipe/` | `pose_landmarker_lite` and `hand_landmarker`, both float16/1 | — |
| `models/face-api/` | weights for the five nets `loadFaceApiModels` loads | 1.7.15 |
| `fonts/` | Roboto, weight 400, every subset | Google Fonts v51 |

39 downloaded files, about 57 MB. `deploy.sh` syncs `activity_midi/` wholesale, so this ships as-is and
the existing `/activity_midi/*` CloudFront invalidation already covers it.

## Refreshing

`./refresh.sh` re-downloads everything from the versions pinned at the top of that script, and
rewrites `SHA256SUMS`. To move to a newer library, edit the version there and re-run it.

`./refresh.sh --verify` downloads a fresh copy to a temp dir and diffs. Files here are kept
byte-identical to upstream so this works — do not hand-edit anything in `vendor/`.

## Things worth knowing

- **face-api was floating.** The old CDN url had no version in it, so the app silently picked
  up whatever was newest. It is pinned to 1.7.15 now, which is what that url resolved to.
- **`vision_bundle.esm.js` is jsdelivr's `+esm` build**, not a file from the npm package. It is
  named `.esm.js` rather than `.mjs` on purpose: not every machine's mimetypes table knows
  `.mjs`, and a module served as `application/octet-stream` is refused by the browser.
- **webgazer bundles its own copy of the FaceMesh javascript**, so `mediapipe/face_mesh/` only
  needs the assets that bundled copy requests by name — the loader, both wasm builds and the
  binarypb. `face_mesh.js` and `package.json` are kept only to record the version.
- **Both nosimd wasm builds are unused on modern browsers** but are kept, since the emscripten
  loaders fall back to them when SIMD is unavailable.
- **Two face-api nets are deliberately absent.** `face_recognition` (6.4 MB) and
  `face_landmark_68_tiny` are in the package but nothing in `core.js` loads them.
- **Source maps 404.** The bundles keep their upstream `sourceMappingURL` comments and the
  `.map` files are not vendored. This only shows up with devtools open, and stripping the
  comments would break the byte-for-byte `--verify` check.
