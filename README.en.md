<div align="center">

[**🇺🇸 EN**](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**Turn any script into viral, multi-style animated stickman videos for Faceless YouTube Channels. Fully open-source.**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Start with a topic, an article, or a link. Automatically create visuals, voiceover, captions, sound effects, and subtle animation, and get a complete stickman video. **Build a distinctive YouTube channel without ever appearing on camera.**

An open-source collection of popular stickman animation styles from across the web, continually updated for **science and knowledge explainers, psychology and motivation, education and awareness, uplifting stories, trending stories, and more.**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>Classic Black & White</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="Classic black-and-white stickman animation: white lines on black for dynamic explainers" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Modern Pop</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="Modern pop stickman animation: red-beanie character with tech lighting" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Prehistoric Cave</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Prehistoric cave stickman animation: short cave stories with a twist" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Cozy Storytelling</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Cozy stickman storytelling: colorful everyday scenes and relatable moments" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Historical Cartoon</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="Historical stickman cartoon: a samurai story in Edo Japan" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Minimal Hand-Drawn</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Minimal hand-drawn stickman video: expressive characters, key text, and subtle animation" width="90%"></a>
</td>
</tr>
</table>

<div align="center">

**6 styles · 8 visual options · Tested examples · Free and open source**

⭐ **Star the project to keep up with new stickman styles as they arrive.**

[Get started](#quick-start) · [A styles](#a-styles) · [B styles](#b-styles) · [FAQ](#faq)

</div>

<a id="creation-modes"></a>

## Two ways to make your video

**Want control over every shot? Choose A · Director Mode. Want a finished long-form video without assembling every scene? Choose B · Autopilot Mode.** One project, two workflows.

|  | <div align="center">A · Director Mode</div> | <div align="center">B · Autopilot Mode</div> |
|:---:|:---|:---|
| **Approach** | **You control production; AI plans the shots.** Get storyboards and prompts, then generate clips and edit them yourself. | **Give it a topic or a brief; get a finished video.** Automate illustrations, voiceover, captions, subtle animation, and video assembly. |
| **Length** | **Short-first**, typically 30 seconds–3 minutes. Longer videos can be built scene by scene. | **Long-form-first**, especially narrated videos of **10 minutes or more**. Also works for shorts and episodic stories. |
| **Tools** | Plan with a Skill-compatible AI assistant, generate clips in **Google Flow** or a similar service, then edit in **CapCut** or your preferred editor. | Run in **Codex, Claude Code**, or another AI coding agent that can read and write files, call tools, and execute commands to connect generation with local rendering. |
| **Visuals** | **Generated animated clips**, with character movement, camera direction, and interactions. | **Illustrated scenes with subtle animation**, using cuts, pans, and zooms to support the narration rather than generating a full-motion clip for every scene. |
| **Output** | A director's treatment, storyboards, scene-by-scene video prompts, and sound design. | **A complete video file with voiceover, captions, and subtle animation.** |
| **Start** | <div align="center"><a href="#director-start">Use Director Mode</a></div> | <div align="center"><a href="#autopilot-start">Use Autopilot Mode</a></div> |

Both workflows can start with **a topic, copy, or a complete script**. **A and B have separate style numbers, galleries, and visual assets; new styles and examples are added to their own series.** Choose the aspect ratio, narration language, and voice you need. The lengths above are recommendations, not limits.

Autopilot Mode needs working image and voice generation services plus a local video-rendering environment. A standard chat window alone cannot replace that setup. The Skill is free and open source; connected services may charge separately.

<a id="quick-start"></a>

## Get started

Send the following to an AI assistant that supports Skills. After installation, it will explain **what each mode produces and how to begin**, with examples you can copy.

```text
Install this Skill for me:
https://github.com/kaomei/stickman-video-director

Once installed, read the installed SKILL.md right away.
Explain what each mode produces, the tools it needs, and the workflow
in plain language, with examples I can copy.
Based on what I want to make, tell me what is missing and exactly what to do next.
```

<a id="director-start"></a>

### A · Director Mode: scene-by-scene video prompts

After installation, send this to your AI assistant and replace the placeholder with your topic:

```text
Use Director Mode / mode A to turn the following topic, copy, or brief
into a stickman video:
[Enter a topic, paste your copy, or describe what you need]

Requirements: landscape 16:9, A3 "Prehistoric Cave" style, starting with 30 seconds.
Give me the director's treatment first. After I approve it, provide scene-by-scene video prompts.
```

**Workflow: share your topic and brief → develop the story script → optionally approve front, side, and back character views → generate detailed storyboard prompts → manually generate clips and edit the final video**

The treatment covers the story structure, scene-by-scene narration, actions, camera direction, and sound design. Copy each prompt into [Google Flow](https://flow.google.com/) or another video generator, then add captions and finish the edit in CapCut or your preferred editor.

For your first video, follow the [full production walkthrough](https://x.com/CrazyKaomei/status/2102311241046008268) (in Chinese).

<a id="autopilot-start"></a>

### B · Autopilot Mode: from a brief to a long-form video

After installing in Codex, Claude Code, or another environment with file access and command execution, try:

```text
Use Autopilot Mode / mode B to turn the following topic, article, post, news item, or brief
into a compelling YouTube video:
[Paste content or a link, or describe what you want to promote]

Requirements: 5–10 minutes, landscape 16:9, B1 "Minimal Hand-Drawn" style, with voiceover, captions, and sound effects.

Check the image generation, voiceover, and video-rendering setup first. Then give me a script and a 20-second preview with sound.
After I approve it, build the full video with visuals timed to the narration. Deliver a complete video file; I do not want to assemble scenes myself.
```

**Workflow: share a topic, content, or brief → approve the script → approve a 20-second preview with sound → automatically produce the full video → receive the finished video file**

The AI assistant plans the scenes, generates the visuals and narration, adds captions and sound effects, and renders a complete video to the voiceover's timing. You approve the script and preview; you do not have to generate and assemble every scene yourself.

On first use, it checks the required setup and walks you through anything missing. If a visual or voiceover section needs work, revise just that section and keep what you have already approved.

<a id="style-gallery"></a>

<a id="a-styles"></a>

## A · Director Mode style gallery

Styles are numbered A1, A2, A3… Each includes its own animated examples.

<a id="a1"></a>

### A1: Classic Black & White

Explain an idea with just a few lines. On a pure white or black canvas, characters, props, and a little accent color do the heavy lifting—ideal for brisk, clear explainers.

- **Visual style**: simple round heads, line-drawn limbs, and consistent stroke widths, with occasional simple expressions. Up to three saturated accent colors signal emotion, risk, or action. Abstract ideas become visual metaphors: anxiety as a cage, attention as a progress bar.
- **Best for**: science explainers, psychology, motivation, self-management, business breakdowns, and abstract concepts.
- **Choose your look**: black characters on white feel clean and direct for teaching and everyday explainers. White characters on black create stronger contrast for suspense, conflict, and emotion.

| A1.1 · Black on white | A1.2 · White on black |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1 · Black stick figures on white: animated preview" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2 · White stick figures on black: animated preview" width="360"><!-- demo:dark:end --> |
| Pure white canvas · Black characters | Pure black canvas · White characters |

---

<a id="a2"></a>

### A2: Modern Pop

A red beanie and yellow T-shirt give this character an instantly recognizable look. Explain a product in a clean tech setting, or follow the character into bedrooms, city streets, and the wilderness for a story with real ups and downs.

- **Visual style**: a minimalist character with a consistent red beanie and yellow shirt, in two types of setting. Minimal Tech pairs white space and a faint grid with floating glass-like interfaces and cyan light. Colorful Story uses richer scenery, lighting, and depth to set the mood.
- **Best for**: Minimal Tech suits AI tools, tech products, tutorials, and feature walkthroughs. Colorful Story works for personal growth, everyday life, adventure, and motivational stories.
- **Choose your look**: explaining a tool or method? Pick Minimal Tech. Taking viewers through a character's experience? Pick Colorful Story.

| A2.1 · Minimal Tech | A2.2 · Colorful Story |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1 · Minimal Tech: animated preview" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2 · Colorful Story: animated preview" width="360"> |
| White space · Faint grid · Cyan glow | Colorful scenes · Cinematic lighting · Story atmosphere |

---

<a id="a3"></a>

### A3: Prehistoric Cave

Take today's problems back to a world without phones or offices. Caves, animal skins, campfires, and exaggerated expressions turn the absurdities of work and human nature into short stories with a twist.

- **Visual style**: bold hand-drawn strokes, solid white heads, dark limbs, animal-skin clothing, and earthy surroundings. Character interactions, reaction shots, and comic pauses drive the story. Design the cast for each story—different ages and genders are welcome; not every story needs the same face.
- **Best for**: prehistoric what-ifs, workplace satire, observations on human nature, dark comedy, fables, and English-learning stories for children.
- **Choose this when**: a small story needs an “aha” moment or an unexpected turn. Modern relationships transplanted into a prehistoric tribe make for jokes that feel both familiar and surprising.

| Example 1: "How Did Humans Get Their First Job?" | Example 2: "The First Discovery of Fire" |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="How Did Humans Get Their First Job? Animated preview" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="The First Discovery of Fire: community animation" width="360"> |
| Prehistoric story · Workplace twist | Discovery of fire · Community creation |

---

<a id="a4"></a>

### A4: Cozy Storytelling

A mug too special to use. A message you feel you have to answer immediately. An afternoon finally kept for yourself. Simple characters inhabit colorful everyday settings, telling relatable stories through movement, expressions, and camera work.

- **Visual style**: solid white round heads, slim bodies, fine dark limbs, and natural expressions in fully illustrated 2D environments. Wide shots establish the setting, close-ups capture hesitation or relief, and tracking shots follow the character forward.
- **Best for**: relatable everyday stories, personal growth, relationships, heartwarming moments, habit-building, and English-learning content for children.
- **Choose this when**: you want viewers to recognize themselves in a small moment. Adapt the colors and lighting to the theme, from warmth and comfort to anxiety, exhaustion, and starting over.

| Example 1: Message anxiety on the commute | Example 2: Making time for yourself |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="Cozy Storytelling: message anxiety at a subway station" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Cozy Storytelling: a quiet break at an outdoor café" width="360"> |
| Subway station · Walking shots · Emotional close-ups | Outdoor café · Warm light · Everyday gestures |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5: Historical Cartoon

Send stick figures into history: samurai on Edo streets, black cats in ancient Egyptian temples, soldiers in Roman camps. Period clothing, colorful settings, and playful contrasts make history easier to picture.

- **Visual style**: solid white round heads, black oval eyes, bold clear outlines, and thin line-drawn limbs, paired with period clothing, soft cel shading, and colorful backgrounds. Change the costumes, buildings, props, and music for each place and era while keeping the same character drawing style.
- **Best for**: world history, curious facts about civilizations, everyday life in the past, historical figures, and humorous history shorts.
- **Choose this when**: you want to turn a fact into something a character actually experiences. Reactions and story twists help a small historical detail hold the viewer's attention.

| Example 1: Edo Japan · A samurai's everyday life | Example 2: Ancient Egypt · Cats and mummies |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="Historical Cartoon: an Edo samurai and everyday street life" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="Historical Cartoon: ancient Egyptian temples, black cats, and mummies" width="360"> |
| Edo streets · Samurai clothing · Everyday contrasts | Colorful temples · Black cat characters · History with a twist |

Style and prompt contribution: [Lawal Ridwan / @leksautomate](https://github.com/leksautomate).

---

<a id="b-styles"></a>

## B · Autopilot Mode style gallery

Styles are numbered B1, B2, B3… Each has its own finished examples combining illustrated scenes with subtle animation, maintained separately from the A series.

<a id="b1"></a>

### B1: Minimal Hand-Drawn

Let the narration lead. Expressive stick figures, colorful hand-drawn props, and bold on-screen text make ideas, stories, and product benefits clear and engaging.

- **Visual style**: near-white paper with a barely visible grid, black hand-drawn lines, and a few colorful props. Expressive faces, small animated details, flowing transitions, and sound effects keep the story moving. On-screen text highlights key ideas; captions follow the narration.
- **Best for**: YouTube explainers, psychology and personal growth, workplace stories, educational videos, and product promotion.
- **Choose this when**: you want a complete narrated, captioned video from a topic, copy, or story script. The visuals follow the voiceover's natural rhythm, making it a good fit for sustained explanations and long-form storytelling.

Click a GIF to view or download the preview with sound.

<table width="100%">
  <tr>
    <th width="50%" align="center">Example 1: YouTube without showing your face</th>
    <th width="50%" align="center">Example 2: Why is nobody watching?</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="B1 Minimal Hand-Drawn example 1: click to view or download a faceless YouTube video preview with sound" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="B1 Minimal Hand-Drawn example 2: click to view or download a Bodi-narrated preview with captions and expressive animated characters" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">Hand-drawn characters · Key text · Subtle animation</td>
    <td align="center">Bodi voiceover · Expressive faces · Subtle animation</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2: Coming soon…

A style overview, dedicated examples, and usage prompts will be added here.

<!-- readme:reliability -->

<a id="faq"></a>

## Frequently asked questions

### Q1. Can I make a video without a script?

Yes. Give the AI assistant a topic, an article, a link, or a brief, and it will shape that into a video script. You can also bring a finished script. Include your target audience, publishing platform, and intended length for a more focused result.

### Q2. Can Director Mode styles be fully automated? Why keep Director Mode?

The A series currently has its own production workflows, but you can ask your AI assistant to combine your preferred A-series style with the B-series workflow for a DIY adaptation.

Director Mode is retained primarily to keep video generation and experimentation costs under control. For a video over ten minutes long, one complete generation pass can cost **tens of US dollars**, and repeated attempts add to the bill. That's why Director Mode keeps generation and review scene by scene, followed by manual editing: you stay in control of every shot, check the results, and then decide whether to continue.

### Q3. How do I keep characters consistent in Director Mode?

Ask your AI assistant: “First design a stick figure that fits my chosen style. Let me approve the front, side, and back views before writing the storyboard prompts.” This also works if you want a character of your own. Reuse approved character references when you have them; skip this optional step if you do not need a custom design.

If your video tool supports reference images, **attach the approved character image to every clip you generate**. References supplement the existing storyboard prompts; they do not replace those prompts or change the selected style's rules. Check the finished clips for consistency.

### Q4. Do I have to use Codex?

No. Director Mode works in AI assistants that support installing and using Skills.

Autopilot Mode needs an environment such as Codex or Claude Code that can read and write files and execute commands, plus the required image generation, voiceover services, and local dependencies.

<!-- readme:platforms -->

### Q5. How do I turn an article or reference into a more engaging video?

Tell your AI assistant who you want to reach, what matters most, and what you want viewers to do afterward. It can develop the angle, opening hook, narrative progression, and call to action, then turn those into scenes.

You can also share a reference video and say what you like about its pacing, delivery, or story structure. Learn from the approach while keeping your own perspective and wording. Verify historical, business, and scientific claims before publishing.

### Q6. Does it cost anything?

The Skill is free and open source. Image generation, voiceover, and video generation services charge according to the platform and account plan you choose. A consumer subscription does not necessarily include API credits.

### Q7. Do I have to redo everything if a visual or voiceover is wrong?

No. Approve the script and production plan first, then check a short preview for style, characters, voice, captions, and pacing before making the full video.

If only one section needs work, revise that section and reuse the approved voiceover and assets to avoid unnecessary rework and generation costs.

### Q8. Can I publish on YouTube or use the videos commercially?

The project uses the MIT license, which permits commercial use. Third-party images, music, sound effects, and voiceover services remain subject to their own license terms. YouTube monetization is subject to the platform's review and policies.

<!-- readme:contribute -->

## Road to 10,000 Stars & Creator Ecosystem

**Every star fuels the next drop!** Together, we’re building a 100% free, open-source studio to help solo creators run faceless channels without $50/mo SaaS subscriptions.

- [x] **1,000 Stars**: Shipped Director Mode + 5 core visual styles
- [x] **3,000 Stars**: Shipped AutoPilot Mode for 1-click video generation
- [ ] **🔥 5,000 Stars**:
  - 5–10 new visual styles drop
  - 1-click batch editor for YouTube Shorts & TikTok
- [ ] **7,500 Stars**:
  - 1,000+ viral YouTube script prompt vault
  - 200+ royalty-free, Content-ID safe SFX and transitions
- [ ] **10,000 Stars**: Launch the official all-in-one Web Studio

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="GitHub star history for kaomei/stickman-video-director" width="800">
  </picture>
</a>
</div>

<a id="whats-next"></a>

## Planned Visual Styles

We are actively training new specialized engines for the most requested faceless YouTube niches:

- **OverSimplified History & Lore** — Tiny historical figures, conquest arrows & satirical battle maps
- **Stickman Combat & Speedlines** — Alan-Becker-style dynamic combat, martial arts & impact frames
- **Dark Psychology & Stoic Noir** — Moody silhouettes, glowing eyes & 48-Laws-of-Power storytelling
- **Wall Street & Silicon Valley Parody** — Suit-and-tie stickmen, crashing charts & corporate roasts
- **Two-Mic Podcast & Stand-Up** — Snappy dialogue comedy, interview repurposing & character banter
- **Internet Mysteries & Urban Legends** — Eerie pencil sketches, analog glitch & Reddit mystery lore

## Community & Submissions

Want to suggest a style or get your channel featured? Message **[@CrazyKaomei](https://t.me/CrazyKaomei)** on Telegram:

- **Request a Style**: Send a visual reference link + the niche you want to cover.
- **Get Featured**: Made a video with this tool? Send your link to be showcased in this README and on our official YouTube channel!

🔔 *Follow **[@CrazyKaomei](https://x.com/CrazyKaomei)** on X for daily video workflows, automation tools, and channel growth SOPs.*

## License

Released under the [MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE). Free to use, modify, distribute, and use commercially. Keep the original copyright and license notice when distributing the project or substantial portions of it.

Provided “as is,” without warranty. See [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) for the full terms.
