# B4 opening font

- File: `Nunito.ttf`, a static weight-900 instance used by landscape `b4-hook-v1` and the setup line of `b4-portrait-poster-v1`. The weight is baked into the glyph outlines, not left to the renderer's variable-font interpretation.
- Source: [Google Fonts / Nunito](https://github.com/google/fonts/tree/main/ofl/nunito).
- License: [SIL Open Font License 1.1](OFL-Nunito.txt); the derived static font remains under this license with the original copyright notice.
- SHA-256: `e67d3588b1bcf9879f814de3696f44d52153a573bf8e41d3be37837e9295ec82`.

Build provenance: Google Fonts' upstream `Nunito[wght].ttf` (SHA-256 `bb55a5ca5c2042335b3991af27c4d0705d0ef41cac6164ac737fd8f2a1e85207`), instantiated with FontTools 4.68.0: `fonttools varLib.instancer Nunito-variable-source.ttf wght=900 --update-name-table --no-recalc-timestamp --output=Nunito.ttf`. No FontTools installation is needed to use the bundled runtime. Regression tests require no `fvar` table and `OS/2.usWeightClass=900`.

The accepted B4 sample used system Arial Rounded Bold. That proprietary font is not redistributed here. Nunito 900 preserves a rounded heavy visual grammar portably, with the preset's warm-white/coral colors, outline, shadow and uniform scale-settle; it is not pixel-identical to the original font. Do not silently substitute a system sans-serif if this asset is absent or changed: repair the installation instead.

The bundled face supports Latin, Cyrillic and Vietnamese hook copy. Uncovered scripts require an explicit user-agreed localized font treatment and review; the default gate rejects silent fallback. This font lock is scoped to B4 opening title layers, not other B styles or all synchronized captions.

`Anton.ttf` is the bundled OFL narrow display face for the payoff of `b4-portrait-poster-v1` and explicitly authored B4 cinematic text (see [OFL-Anton.txt](OFL-Anton.txt)). Its SHA-256 is `fd9301f2837c99df2be07cc7f0be66e9470f5354d8fcf1606027c67fcd637a53`. Portrait uses it at natural letter proportions with authored semantic lines and measured ink/shadow bounds. It does not replace the landscape rounded opening or provide glyphs for every language; uncovered scripts retain the declared localization and independent encoded-review requirements above.

## B6 caption font

- File: `ArchivoBlack.ttf`, the unmodified Archivo Black regular face; B6 uses its heavy outlines for captions.
- Source: [Google Fonts / Archivo Black](https://github.com/google/fonts/tree/main/ofl/archivoblack).
- License: [SIL Open Font License 1.1](OFL-ArchivoBlack.txt), including the original copyright notice.
- SHA-256: `dd9a89a019b4849f66ab75455fe7bdf931311042cbb0f0f97acc061539703180`.

The project owner approved Archivo Black as B6’s default subtitle face on 2026-11-13 after a same-size/outline comparison with the earlier Arial Black sample. Preserve B6’s fixed caption size, baseline, outline and phrase timing. The historical sample still supplies the drawing/animation reference; this approved font change does not require a proprietary font for new stories.
