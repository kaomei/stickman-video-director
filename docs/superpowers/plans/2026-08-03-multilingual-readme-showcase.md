# Multilingual README Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the compact English repository README with an attractive creator-first English homepage, four complete localized versions, and two polished preview placeholders that can later be swapped for real light- and dark-theme clips.

**Architecture:** Keep English at `README.md` and store each complete localization in a sibling README file linked by an identical language switcher. Use shared SVG preview assets and stable HTML section markers so a deterministic shell test can verify language parity, local links, platform terminology, installation commands, and future demo replacement points.

**Tech Stack:** GitHub Flavored Markdown, inline HTML, SVG, Bash, ripgrep, Git, official Codex Skill validator.

## Global Constraints

- Default repository homepage is English.
- Localized files are `README.zh-CN.md`, `README.ja.md`, `README.ko.md`, and `README.pt-BR.md`.
- Every README starts with language links in this order: English, 简体中文, 日本語, 한국어, Português do Brasil.
- Every README includes equivalent hero, demo, advantages, platform, workflow, output, installation, reliability, repository, contribution, star, and license sections.
- All five versions use natural creator-focused language while preserving identical commands, paths, model names, platform names, ratios, and verified capability claims.
- The hero targets YouTube Shorts, TikTok, Instagram Reels, and YouTube creators without guaranteeing views, engagement, or virality.
- The two demo positions use shared 16:9 SVG placeholders under `assets/readme/` until the user supplies real clips.
- Runtime Skill files, prompt contracts, tests, and model behavior remain unchanged.
- No user-facing content may include an old GitHub identity, private email identifier, or machine-specific home path.

## File Map

```text
README.md                                              English default homepage
README.zh-CN.md                                        Simplified Chinese localization
README.ja.md                                           Japanese localization
README.ko.md                                           Korean localization
README.pt-BR.md                                        Brazilian Portuguese localization
assets/readme/light-theme-preview-placeholder.svg      Light-theme 16:9 demo placeholder
assets/readme/dark-theme-preview-placeholder.svg       Dark-theme 16:9 demo placeholder
tests/verify-readmes.sh                                Deterministic parity and link checks
docs/superpowers/specs/2026-08-03-readme-showcase-localization-design.md
                                                        Approved copy and layout contract
```

---

### Task 1: Add the README Contract Test

**Files:**
- Create: `tests/verify-readmes.sh`

**Interfaces:**
- Consumes: A repository-root working directory and optional README filenames.
- Produces: Exit `0` when every supplied README satisfies the shared contract; nonzero with a precise missing-file or missing-token message otherwise.

- [ ] **Step 1: Write the failing structural test**

Create `tests/verify-readmes.sh` with this behavior:

```bash
#!/usr/bin/env bash
set -euo pipefail

readme_root=$(git rev-parse --show-toplevel)
default_readmes=(
  README.md
  README.zh-CN.md
  README.ja.md
  README.ko.md
  README.pt-BR.md
)
preview_assets=(
  assets/readme/light-theme-preview-placeholder.svg
  assets/readme/dark-theme-preview-placeholder.svg
)
section_markers=(
  '<!-- readme:hero -->'
  '<!-- readme:demos -->'
  '<!-- readme:advantages -->'
  '<!-- readme:platforms -->'
  '<!-- readme:workflow -->'
  '<!-- readme:output -->'
  '<!-- readme:install -->'
  '<!-- readme:reliability -->'
  '<!-- readme:contribute -->'
)
shared_tokens=(
  'README.md'
  'README.zh-CN.md'
  'README.ja.md'
  'README.ko.md'
  'README.pt-BR.md'
  'assets/readme/light-theme-preview-placeholder.svg'
  'assets/readme/dark-theme-preview-placeholder.svg'
  'YouTube Shorts'
  'TikTok'
  'Instagram Reels'
  'Gemini Omni Flash'
  '16:9'
  '9:16'
  '1:1'
  '$directing-stickman-videos'
  'git clone https://github.com/kaomei/stickman-video-director.git'
  'cp -R skills/directing-stickman-videos'
  'MIT'
)

if (( $# > 0 )); then
  readmes=("$@")
else
  readmes=("${default_readmes[@]}")
fi

for asset in "${preview_assets[@]}"; do
  [[ -f "$readme_root/$asset" ]] || {
    printf 'missing preview asset: %s\n' "$asset" >&2
    exit 1
  }
done

for readme in "${readmes[@]}"; do
  readme_path="$readme_root/$readme"
  [[ -f "$readme_path" ]] || {
    printf 'missing README: %s\n' "$readme" >&2
    exit 1
  }

  for marker in "${section_markers[@]}"; do
    rg -Fq "$marker" "$readme_path" || {
      printf '%s missing section marker: %s\n' "$readme" "$marker" >&2
      exit 1
    }
  done

  for token in "${shared_tokens[@]}"; do
    rg -Fq "$token" "$readme_path" || {
      printf '%s missing shared token: %s\n' "$readme" "$token" >&2
      exit 1
    }
  done

  forbidden_identity='eva''2050|240669''650|/Users/''eva'
  forbidden_claims='guaranteed ''viral|guaranteed ''views'
  if rg -n "${forbidden_identity}|${forbidden_claims}" "$readme_path"; then
    printf '%s contains forbidden identity or unsupported claim\n' "$readme" >&2
    exit 1
  fi
done

printf 'README contract passed for %s file(s).\n' "${#readmes[@]}"
```

Make the script executable:

```bash
chmod +x tests/verify-readmes.sh
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
tests/verify-readmes.sh README.md
```

Expected: exit `1` with `missing preview asset: assets/readme/light-theme-preview-placeholder.svg` because the shared media assets do not exist yet.

- [ ] **Step 3: Verify the failure is about the new contract**

Run:

```bash
tests/verify-readmes.sh
```

Expected: exit `1` for the same missing preview asset before it can reach the missing localized README checks. This confirms the test is exercising the desired new repository shape.

- [ ] **Step 4: Commit the RED contract test**

```bash
git add tests/verify-readmes.sh
git diff --cached --check
git commit -m "test: define multilingual README contract"
```

---

### Task 2: Build the Shared Demo Assets and English Homepage

**Files:**
- Create: `assets/readme/light-theme-preview-placeholder.svg`
- Create: `assets/readme/dark-theme-preview-placeholder.svg`
- Modify: `README.md`
- Test: `tests/verify-readmes.sh`

**Interfaces:**
- Consumes: The section markers and shared tokens enforced by `tests/verify-readmes.sh`.
- Produces: Two shared 16:9 preview frames and the canonical English content used as the localization source.

- [ ] **Step 1: Confirm the English target is still RED**

Run:

```bash
tests/verify-readmes.sh README.md
```

Expected: exit `1` because the preview assets and required section markers are absent.

- [ ] **Step 2: Create the light-theme SVG placeholder**

Create a `1280×720` SVG with a white-to-pale-gray background, black stick figure, electric-blue and violet accent shapes, motion trails, three timeline beat markers, a rounded `LIGHT THEME` label, and centered text `Preview clip coming soon`. Include an accessible `<title>` and `<desc>`. Keep all text and strokes readable at a 600-pixel README width.

- [ ] **Step 3: Create the dark-theme SVG placeholder**

Create a matching `1280×720` SVG with a near-black background, white stick figure, saturated purple and cyan accents, a stylized vortex, motion trails, three timeline beat markers, a rounded `DARK THEME` label, and centered text `Preview clip coming soon`. Use the same geometry, typography, accessible metadata, and outer spacing as the light version.

- [ ] **Step 4: Rewrite the English README as the canonical creator landing page**

Use this visible sequence and the exact stable markers:

```markdown
<!-- readme:hero -->
Language switcher → title → promise → badges → platform sentence

<!-- readme:demos -->
Two-column light/dark preview table → first star invitation

Problem statement → one-sentence outcome

<!-- readme:advantages -->
Verified capabilities grouped as script intelligence, visual density, production locks, and creator control

<!-- readme:platforms -->
9:16 / 16:9 / 1:1 platform-fit table

<!-- readme:workflow -->
Paste → Choose → Approve → Generate → Stitch

<!-- readme:output -->
Concise list of the director proposal, 130–150 word VO, six scenes, six prompts, audio and stitching notes

<!-- readme:install -->
Clone → copy Skill → restart → invoke

<!-- readme:reliability -->
Approval gate, aspect-ratio recomposition, source fidelity, and audio continuity

<!-- readme:contribute -->
Repository map → contribution invitation → final star call → MIT
```

Use the hero promise: `Turn any idea into a one-minute stickman video built to move.` Follow it with a factual sentence that names YouTube Shorts, TikTok, Instagram Reels, and YouTube. Describe the audience as creators of explainers, motivational stories, educational shorts, and visual essays.

Use the same language navigation links required by the contract. Bold `English` in `README.md`. Add HTML comments `<!-- demo:light:start -->`, `<!-- demo:light:end -->`, `<!-- demo:dark:start -->`, and `<!-- demo:dark:end -->` around the two preview cells for later media replacement.

The advantages must state the verified Skill features from the approved design and avoid popularity numbers or engagement promises. Include one friendly star invitation below the demos and another at the end.

- [ ] **Step 5: Run the English contract test to verify GREEN**

Run:

```bash
tests/verify-readmes.sh README.md
```

Expected: `README contract passed for 1 file(s).`

- [ ] **Step 6: Inspect the SVG files and commit**

Run:

```bash
xmllint --noout assets/readme/light-theme-preview-placeholder.svg
xmllint --noout assets/readme/dark-theme-preview-placeholder.svg
git diff --check
```

Expected: both XML checks exit `0` and `git diff --check` prints nothing.

Commit:

```bash
git add README.md assets/readme
git commit -m "docs: create creator-first English showcase"
```

---

### Task 3: Add Simplified Chinese and Japanese Localizations

**Files:**
- Create: `README.zh-CN.md`
- Create: `README.ja.md`
- Test: `tests/verify-readmes.sh`

**Interfaces:**
- Consumes: The canonical structure, links, commands, verified claims, assets, and markers from `README.md`.
- Produces: Complete natural Simplified Chinese and Japanese creator-facing versions with identical operational content.

- [ ] **Step 1: Verify both localized targets are RED**

Run:

```bash
tests/verify-readmes.sh README.zh-CN.md
tests/verify-readmes.sh README.ja.md
```

Expected: each command exits `1` with `missing README` for its requested file.

- [ ] **Step 2: Write the Simplified Chinese README**

Mirror every English section and stable marker. Bold `简体中文` in the language switcher. Use natural creator vocabulary such as `短视频创作者`, `分镜`, `旁白`, `视觉隐喻`, `转场`, and `提示词生产包`. Translate the promise as an energetic benefit rather than word-for-word English. Preserve platform names, code blocks, paths, model names, ratios, and the Skill invocation exactly.

- [ ] **Step 3: Write the Japanese README**

Mirror every English section and stable marker. Bold `日本語` in the language switcher. Use natural terms such as `ショート動画クリエイター`, `絵コンテ`, `ナレーション`, `視覚的メタファー`, `トランジション`, and `プロンプトパッケージ`. Keep the tone concise and professional rather than translating English marketing idioms literally. Preserve operational tokens exactly.

- [ ] **Step 4: Run both contract tests to verify GREEN**

Run:

```bash
tests/verify-readmes.sh README.zh-CN.md README.ja.md
```

Expected: `README contract passed for 2 file(s).`

- [ ] **Step 5: Compare command blocks and commit**

Run a focused diff of extracted command lines:

```bash
for file in README.md README.zh-CN.md README.ja.md; do
  rg 'git clone|cp -R|\$directing-stickman-videos' "$file"
done
git diff --check
```

Expected: all files expose the same clone URL, copy command prefix, and Skill invocation; whitespace check is clean.

Commit:

```bash
git add README.zh-CN.md README.ja.md
git commit -m "docs: add Chinese and Japanese READMEs"
```

---

### Task 4: Add Korean and Brazilian Portuguese Localizations

**Files:**
- Create: `README.ko.md`
- Create: `README.pt-BR.md`
- Test: `tests/verify-readmes.sh`

**Interfaces:**
- Consumes: The canonical English README and the shared localization contract.
- Produces: Complete Korean and Brazilian Portuguese versions that make the five-language test pass.

- [ ] **Step 1: Verify both remaining targets are RED**

Run:

```bash
tests/verify-readmes.sh README.ko.md
tests/verify-readmes.sh README.pt-BR.md
```

Expected: each command exits `1` with `missing README`.

- [ ] **Step 2: Write the Korean README**

Mirror every English section and stable marker. Bold `한국어` in the language switcher. Use natural terms such as `숏폼 크리에이터`, `스토리보드`, `영어 내레이션`, `시각적 은유`, `전환`, and `프롬프트 패키지`. Keep sentences direct and creator-oriented. Preserve operational tokens exactly.

- [ ] **Step 3: Write the Brazilian Portuguese README**

Mirror every English section and stable marker. Bold `Português do Brasil` in the language switcher. Use Brazilian creator vocabulary such as `criadores de vídeos curtos`, `storyboard`, `narração`, `metáforas visuais`, `transições`, and `pacote de prompts`. Prefer Brazilian phrasing such as `cole seu texto` and `vídeo de um minuto`; avoid European Portuguese forms. Preserve operational tokens exactly.

- [ ] **Step 4: Run the complete contract to verify GREEN**

Run:

```bash
tests/verify-readmes.sh README.ko.md README.pt-BR.md
tests/verify-readmes.sh
```

Expected: targeted test reports 2 files and full test reports 5 files, both at exit `0`.

- [ ] **Step 5: Commit the final localizations**

```bash
git diff --check
git add README.ko.md README.pt-BR.md
git commit -m "docs: add Korean and Brazilian Portuguese READMEs"
```

---

### Task 5: Validate, Repackage, and Publish

**Files:**
- Verify: all five README files, two SVGs, runtime Skill folder, Git history
- Rebuild: the sibling archive resolved as `$(dirname "$(git rev-parse --show-toplevel)")/stickman-video-director.zip`

**Interfaces:**
- Consumes: The completed repository at `main`.
- Produces: A validated GitHub repository and downloadable ZIP with the same clean `kaomei` history.

- [ ] **Step 1: Run all README and asset checks**

```bash
tests/verify-readmes.sh
xmllint --noout assets/readme/light-theme-preview-placeholder.svg
xmllint --noout assets/readme/dark-theme-preview-placeholder.svg
git diff --check
```

Expected: five READMEs pass, both SVGs parse, and the diff check prints nothing.

- [ ] **Step 2: Run identity and unsupported-claim scans**

```bash
forbidden_identity='eva''2050|240669''650|/Users/''eva'
forbidden_claims='guaranteed ''viral|guaranteed ''views'
rg -n --hidden --glob '!.git' --glob '!.git/**' "${forbidden_identity}|${forbidden_claims}" .
```

Expected: no matches and exit `1`.

- [ ] **Step 3: Validate the runtime Skill**

```bash
UV_CACHE_DIR=/private/tmp/stickman-skill-uv-cache \
  uv run --with pyyaml \
  python "$CODEX_HOME/skills/.system/skill-creator/scripts/quick_validate.py" \
  skills/directing-stickman-videos
```

Expected: `Skill is valid!`

- [ ] **Step 4: Verify Git identity and commit history**

```bash
git status --short
git log --format='%H | author=%an <%ae> | committer=%cn <%ce> | %s'
```

Expected: clean worktree and every new commit shows `kaomei <307886151+kaomei@users.noreply.github.com>` for author and committer.

- [ ] **Step 5: Rebuild and verify the downloadable ZIP**

```bash
repo_root=$(git rev-parse --show-toplevel)
output_zip=$(dirname "$repo_root")/stickman-video-director.zip
git archive --format=zip --output="$output_zip" HEAD
unzip -t "$output_zip"
forbidden_identity='eva''2050|240669''650|/Users/''eva'
zipgrep -Ei "$forbidden_identity" "$output_zip"
```

Expected: ZIP integrity passes and identity scan returns no matches with exit `1`.

- [ ] **Step 6: Push and verify the public repository**

```bash
git push origin main
git ls-remote origin HEAD refs/heads/main
```

Expected: remote `main` advances to the local `HEAD`. Open the repository homepage and confirm English is default, all five language links resolve, both preview positions render, and the contributors API still returns only `kaomei`.
