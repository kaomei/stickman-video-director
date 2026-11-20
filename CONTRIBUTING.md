# Contributing to Stickman Video Director

[🇺🇸 English](#english) · [🇨🇳 简体中文](#中文)

<a id="english"></a>

Thanks for helping! You don't need to be a programmer to contribute: bug reports, style ideas, showcase videos, documentation and translations all help.

## Ways to contribute

| You want to… | Where |
| --- | --- |
| Report a bug or an installation problem | [Open a bug report](https://github.com/kaomei/stickman-video-director/issues/new/choose) |
| Suggest a feature or improvement | [Open a feature request](https://github.com/kaomei/stickman-video-director/issues/new/choose) |
| Request a new visual style | [Telegram community](https://telegram.me/stickmanskill), with a visual reference link and the niche you want to cover |
| Get your video featured | Send your link in the [Telegram community](https://telegram.me/stickmanskill) |
| Fix docs, translations or code | Open a pull request (see below) |

For anything bigger than a small fix, please open an issue first so we can agree on the approach before you spend time on it. Issues labelled [`good first issue`](https://github.com/kaomei/stickman-video-director/labels/good%20first%20issue) are a good place to start.

## How the repository is organized

```text
skills/directing-stickman-videos/   The Skill itself (this is what users install)
  SKILL.md                          Entry point the agent reads first
  references/                       Per-style and per-workflow instructions
  scripts/                          Code Engine (B) runtime and helpers
  assets/                           Approved references, fonts and the B-mode sound library
  tests/                            Node tests for the runtime
tests/                              Repository checks (README, preservation, style rules)
README*.md                          README in eight languages (nine files)
CHANGELOG.zh-CN.md, CHANGELOG.md    Changelog (Chinese is authoritative) and English translation
```

There is only one Skill. Don't add a second `SKILL.md` anywhere; the tests reject it.

## Setting up

- **Node.js 20+** and **FFmpeg** for the Code Engine (B) runtime.
- **Python 3** with Pillow and NumPy for the Python helpers; some B6 tools also use OpenCV (`opencv-python`).

```bash
cd skills/directing-stickman-videos
npm ci
```

A shallow clone is enough for most changes:

```bash
git clone --depth 1 https://github.com/kaomei/stickman-video-director.git
```

## Running the checks

Repository checks, from the repository root:

```bash
(
  status=0
  for file in tests/verify-*.py; do
    python3 "$file" || { printf 'FAILED: %s\n' "$file"; status=1; }
  done
  exit "$status"
)
```

```bash
bash tests/verify-readmes.sh && bash tests/verify-classic-character.sh
```

Runtime tests:

```bash
cd skills/directing-stickman-videos && npm test
```

Some checks depend on the platform: for example, `tests/verify-a6-finishing.py` currently needs the macOS font Impact. If a check also fails on `main` without your change, mention it in your pull request instead of working around it.

## Ground rules

These rules come from how the project already works. Please follow them so your pull request can be merged quickly.

1. **Keep approved samples and references unchanged.** Approved sample videos, reference images, prompts and their fingerprints are checked by tests. Update them only when the maintainer has agreed to the specific change.
2. **Keep existing IDs and paths.** Style IDs (A1–A7, B1–B7), file paths, anchors and commands (including the `autopilot` file names) are used by agents and tests. Rename only when that is the point of the change, and update every reference.
3. **Keep the READMEs in sync.** Apply shared content changes across all languages. Language-specific corrections can stay in the affected translation. Keep `README.md` and `README.en.md` identical. Run `tests/verify-localized-readmes.py`.
4. **Update both changelogs** for user-facing changes: `CHANGELOG.zh-CN.md` and `CHANGELOG.md`. Only describe what the change actually does.
5. **Only add media you have the rights to.** Record the source, license and required credit for every image, font, voice, music track or sound effect, following the existing `CREDITS.md` files and [music sourcing and license](skills/directing-stickman-videos/references/music-sourcing-and-license.md).
6. **Never commit secrets.** API keys and tokens belong in your local `.env`, which is ignored by git.
7. **Technical checks are not visual approval.** If your change affects how videos look or sound, say what you actually watched and listened to, and attach a short clip or frames if you can.

## Pull requests

- Keep each pull request focused on one change. Small pull requests are reviewed much faster.
- Use a descriptive branch name, such as `docs/…`, `fix/…` or `feat/…`.
- In the description, explain **what** changed and **why**, and list the checks you ran and their results.
- The maintainer reads Chinese. A short Chinese summary at the end of your pull request helps a lot, and machine translation is fine.
- By contributing, you agree that your contribution is licensed under the project's [MIT License](LICENSE).

---

<a id="中文"></a>

## 中文

感谢你的帮助！贡献不一定要写代码：报告问题、建议画风、分享作品、改进文档和翻译都很有价值。

**参与方式**

- 报告问题或安装问题、提出功能建议：[新建 issue](https://github.com/kaomei/stickman-video-director/issues/new/choose)
- 征集新画风、投稿作品：[Telegram 社区](https://telegram.me/stickmanskill)
- 修改文档、翻译或代码：提交 pull request。较大的改动请先开 issue 讨论。

**基本规则**

1. 已确认的样片、参考图、提示词及其指纹均有测试检查。只有维护者同意具体改动时才更新。
2. 保持现有的画风编号（A1–A7、B1–B7）、文件路径、锚点和命令不变。
3. README 的共用内容改动需同步各语言，单个译本的修正只需改对应译本。`README.md` 与 `README.en.md` 保持一致。
4. 面向用户的改动请同时更新 `CHANGELOG.zh-CN.md`（以中文版为准）和 `CHANGELOG.md`。
5. 只添加你有权使用的媒体素材，并记录来源、许可和署名。
6. 不要提交 API 密钥等机密信息。
7. 技术检查通过不等于视觉验收；影响画面或声音的改动，请说明你实际看过、听过的内容。

**提交 PR**

- 每个 PR 只做一件事，说明改了什么、为什么改，以及运行了哪些检查。
- 运行检查的方法见上方英文部分的 "Running the checks"。
- 贡献内容默认采用本项目的 [MIT 许可证](LICENSE)。
