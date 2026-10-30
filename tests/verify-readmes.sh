#!/usr/bin/env bash
set -euo pipefail

readme_root=$(git rev-parse --show-toplevel)
python3 "$readme_root/tests/verify-first-use-guidance.py"
python3 "$readme_root/tests/verify-b-common-quality.py"
python3 "$readme_root/tests/verify-chinese-onboarding.py"
python3 "$readme_root/tests/verify-thumbnail-kit.py"
python3 "$readme_root/tests/verify-localized-readmes.py" "$@"

# Preserve the original published demo files as well as the current inline GIFs.
demo_stems=(
  light-theme-demo dark-theme-demo style-2a-demo style-2b-demo
  style-3-demo style-3-community-fire style-4-cozy-station style-4-cozy-cafe
)
for stem in "${demo_stems[@]}"; do
  for extension in gif mp4; do
    asset="$readme_root/assets/readme/$stem.$extension"
    [[ -f "$asset" ]] || { printf 'missing demo asset: %s\n' "$asset" >&2; exit 1; }
  done
done
for stem in style-5-japan style-5-egypt; do
  [[ -f "$readme_root/assets/readme/$stem.mp4" ]] || {
    printf 'missing historical demo: %s\n' "$stem" >&2; exit 1;
  }
done
printf 'README contract passed.\n'
