#!/bin/bash
# deploy.sh — push activity_midi to https://motion-into-midi.com/
#
# The site is a static S3 bucket behind CloudFront. The bucket root holds what is in this
# folder, so activity_midi/ goes to s3://<bucket>/activity_midi/.
#
# Only activity_midi is deployed, on purpose:
#   - the bucket's root index.html is a redirect object pointing at /activity_midi/index.html,
#     and syncing this folder's index.html over it would break that redirect
#   - grid_midi/, res/ and test/ have never been on the bucket, so syncing them would publish
#     them for the first time, which is not what a deploy of the app should quietly do
# To push one of those, upload it deliberately rather than widening this script.
#
# The bucket and distribution are looked up from the domain, so there is nothing to keep in
# sync here. Override with MIM_BUCKET / MIM_DISTRIBUTION_ID if the lookup is not permitted.
#
# usage:
#   ./deploy.sh              show what would change, then ask before doing it
#   ./deploy.sh -y           skip the confirmation
#   ./deploy.sh -n           dry run only, change nothing
#   ./deploy.sh --delete     also remove files on the bucket that are no longer in activity_midi

set -euo pipefail

SITE="motion-into-midi.com"
PREFIX="activity_midi"
SRC="$(cd "$(dirname "$0")" && pwd)/$PREFIX"

ASSUME_YES=false
DRY_RUN=false
DELETE_FLAG=""

while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes) ASSUME_YES=true ;;
    -n|--dry-run) DRY_RUN=true ;;
    --delete) DELETE_FLAG="--delete" ;;
    -h|--help) sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1 (try --help)" >&2; exit 2 ;;
  esac
  shift
done

[ -d "$SRC" ] || { echo "cannot find $SRC" >&2; exit 1; }

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "Your AWS session is not active. Run 'aws login' and try again." >&2
  exit 1
fi

# Find the CloudFront distribution serving the site, and the bucket behind it
BUCKET="${MIM_BUCKET:-}"
DISTRIBUTION_ID="${MIM_DISTRIBUTION_ID:-}"

if [ -z "$BUCKET" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "looking up the distribution for $SITE..."
  read -r found_id found_origin <<<"$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Aliases.Items, '$SITE')].[Id,Origins.Items[0].DomainName] | [0]" \
    --output text 2>/dev/null || true)"

  if [ -z "${found_id:-}" ] || [ "$found_id" = "None" ]; then
    echo "Could not find a CloudFront distribution aliased to $SITE." >&2
    echo "Set them by hand instead, for example:" >&2
    echo "  MIM_BUCKET=my-bucket MIM_DISTRIBUTION_ID=E123ABC $0" >&2
    exit 1
  fi

  DISTRIBUTION_ID="${DISTRIBUTION_ID:-$found_id}"
  # origin looks like my-bucket.s3.amazonaws.com or my-bucket.s3-website-us-east-1.amazonaws.com
  BUCKET="${BUCKET:-${found_origin%%.s3*}}"
fi

DEST="s3://$BUCKET/$PREFIX/"
EXCLUDES=(--exclude ".DS_Store" --exclude "*/.DS_Store" --exclude ".claude/*")

echo
echo "  from:         $SRC"
echo "  to:           $DEST"
echo "  distribution: $DISTRIBUTION_ID"
echo
echo "changes to be made:"
aws s3 sync "$SRC" "$DEST" "${EXCLUDES[@]}" $DELETE_FLAG --dryrun | sed 's/^/  /'
echo

if [ "$DRY_RUN" = true ]; then
  echo "dry run, nothing was changed."
  exit 0
fi

if [ "$ASSUME_YES" != true ]; then
  printf "deploy these to %s ? [y/N] " "$SITE"
  read -r reply
  case "$reply" in
    y|Y|yes|YES) ;;
    *) echo "cancelled."; exit 0 ;;
  esac
fi

aws s3 sync "$SRC" "$DEST" "${EXCLUDES[@]}" $DELETE_FLAG

# Objects are served without a Cache-Control header, so CloudFront holds them for its default
# TTL. Without this the change would not show up for hours.
echo
echo "invalidating the CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/$PREFIX/*" \
  --query "Invalidation.Id" --output text)

echo "invalidation $INVALIDATION_ID created, it usually clears within a couple of minutes."
echo "waiting..."
if aws cloudfront wait invalidation-completed \
    --distribution-id "$DISTRIBUTION_ID" --id "$INVALIDATION_ID" 2>/dev/null; then
  echo "cache cleared."
else
  echo "stopped waiting, the invalidation is still running and will finish on its own."
fi

echo
echo "deployed: https://$SITE/$PREFIX/index.html"
