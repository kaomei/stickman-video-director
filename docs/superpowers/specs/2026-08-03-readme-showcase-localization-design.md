# Multilingual README Showcase Design

## Goal

Transform the repository homepage from a compact technical README into a creator-first product showcase that helps international short-form video creators understand the Skill quickly, see where the visual demos will live, install it confidently, and feel invited to star the project.

## Audience and positioning

The primary audience is creators producing visual explainers, motivational shorts, educational videos, and social content for YouTube Shorts, TikTok, Instagram Reels, and YouTube. The page positions Stickman Video Director as a reusable Codex Skill that turns source copy into a confirmed one-minute English narration plan and six rich Gemini Omni Flash production prompts.

Marketing copy must be energetic and specific without inventing popularity statistics, performance guarantees, or unsupported model capabilities. It may describe the stick-figure format as well suited to fast, high-contrast social storytelling, but must not claim that the Skill guarantees views, engagement, or virality.

## Information architecture

The default `README.md` is English. Four localized siblings provide complete native-language versions:

- `README.zh-CN.md` — Simplified Chinese
- `README.ja.md` — Japanese
- `README.ko.md` — Korean
- `README.pt-BR.md` — Brazilian Portuguese

Every file begins with the same language navigation in this order: English, 简体中文, 日本語, 한국어, Português do Brasil. The active language is visually emphasized. All five files retain equivalent sections, commands, links, claims, and calls to action while using natural localization rather than literal translation.

## Homepage sequence

1. **Hero:** Product name, a concise creator-focused promise, language switcher, and lightweight badges for Codex Skill, Gemini Omni Flash, one-minute output, and MIT licensing.
2. **Theme demos:** A two-column table directly below the hero for light-theme and dark-theme animation previews.
3. **Star invitation:** A short, friendly sentence explaining that a star helps more creators discover the project.
4. **Problem and outcome:** Explain the gap between having a script and directing a visually dense one-minute animation.
5. **Key advantages:** Present the Skill's concrete production benefits.
6. **Platform and format fit:** Map `9:16`, `16:9`, and `1:1` to common publishing contexts without promising platform performance.
7. **Workflow:** Summarize the experience as Paste → Choose → Approve → Generate → Stitch.
8. **Example output:** Show what users receive after approval, without duplicating the full long example stored in the Skill references.
9. **Installation and usage:** Provide copyable clone, install, restart, and invocation instructions.
10. **Reliability notes:** Explain approval gating, source fidelity, aspect-ratio recomposition, prompt independence, and audio-continuity limits.
11. **Repository structure, contribution invitation, final star call, and license.**

## Demo placeholder strategy

Create two polished SVG placeholders under `assets/readme/`:

- `light-theme-preview-placeholder.svg`
- `dark-theme-preview-placeholder.svg`

The placeholders reserve identical 16:9 presentation frames and clearly label the intended white-background/black-figure and black-background/white-figure demos. They must look intentional on GitHub rather than like broken media.

All README files reference the same two assets. HTML comments mark each demo block so the placeholders can later be replaced with optimized animated GIF or WebP previews derived from the user's clips. The replacement should preserve the two-column layout and alt text. Full-resolution video files may be linked from the preview images if needed because GitHub README video embedding is not consistently rendered.

## Product claims and advantages

The README may highlight these verified capabilities:

- Accepts copy, notes, articles, or topics as source material.
- Requires users to choose `16:9`, `9:16`, or `1:1` and a light or dark stick-figure theme.
- Can strengthen the source into a strong hook, progressive explanation, and closing callback while preserving its central meaning.
- Produces approximately 130–150 words of English narration for about one minute.
- Produces a six-scene director's proposal for confirmation before model prompts.
- Produces exactly six standalone Gemini Omni Flash prompts after approval.
- Directs three timed visual beats, multiple relevant visual devices, camera movement, transitions, BGM, and sound effects per clip.
- Supports saturated accent colors while locking the monochrome character system.
- Repeats critical character, palette, voice, dialogue, audio, and negative constraints for prompt independence.
- Recomposes layouts when the aspect ratio changes rather than mechanically replacing the ratio label.
- Avoids unsupported facts, statistics, quotations, and product claims.

## Localization rules

- Localize headlines and calls to action for native fluency and creator vocabulary.
- Keep commands, filenames, Skill invocation, product names, paths, ratios, and model names unchanged.
- Use the established platform names YouTube Shorts, TikTok, Instagram Reels, and YouTube in every language.
- Preserve the same heading hierarchy and approximate section order for maintainability.
- Keep the English title and canonical technical terms where translating them would make installation or invocation ambiguous.
- Use Brazilian Portuguese, not European Portuguese.

## Visual and copy style

The page should feel energetic, modern, and creator-friendly while remaining readable as open-source documentation. Use short paragraphs, scannable bullets, restrained emoji, and clear calls to action. Avoid excessive badges, hype, all-caps paragraphs, fake testimonials, social-proof numbers, or claims that the project is already popular.

## Verification

Before publishing:

- Confirm all five README files exist and cross-link correctly.
- Confirm every language includes the hero, two demo positions, key advantages, workflow, installation, limitations, star invitation, and license.
- Confirm all local links and demo assets resolve with exact filename casing.
- Confirm commands and Skill invocation are identical across languages.
- Scan for unfinished markers, broken local paths, old account identities, and unsupported virality claims.
- Run `git diff --check`, the official Skill validator, and ZIP integrity checks.
- Verify the Git commit author and committer remain `kaomei` before pushing.

## Out of scope

This change does not alter the runtime Skill workflow, prompt contracts, examples, tests, or model behavior. The actual light and dark video clips will be integrated in a later change after the user supplies them.
