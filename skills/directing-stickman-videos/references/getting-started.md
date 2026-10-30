# First use and stage guidance

## Installation handoff and first invocation

A standalone Skill is loaded when invoked; its files do not provide a universal post-install execution hook. When the assistant performs installation, verify it and then read the installed `SKILL.md` and present the introduction in that same conversation. If the user installed through a terminal or another host, present it on the first invocation. Do not add an npm install hook, background task, second Skill or plugin just to display a welcome. Say "installed" only after installation has actually been verified.

Maintain one shared guide, not separate onboarding editions for each README language. Follow an explicit guidance-language request first, otherwise use the user's current conversation language. If that is unclear, use the host/application or local language setting when it is already available; do not scan unrelated settings to infer it. If neither gives a clear language, ask one brief language question. Translate the explanation and examples naturally; keep commands, paths, service/voice identifiers and A/B style codes intact. Guidance language is independent of narration/subtitle language: a Chinese conversation can request an English video, and English-default narration must not force English onboarding. Do not infer guidance language from the README edition or source article alone.

Give a readable quick-start, not just a greeting or two mode names. Show it once in the current conversation, not before every task. Do not write global user settings or an installed-Skill marker to remember it. When resuming, inspect the existing checkpoint and outputs instead of replaying onboarding or production.

### A practical first-use explanation

With no brief yet, use short headings like a README quick-start. Explain the actual deliverable, suitable content/duration, tools to prepare, production sequence and a copyable request. Distinguish what the assistant does from what the user needs to do. Explain "生图" as creating illustrations and "本地合成" as combining pictures, voice and captions into video; do not lead with commands, dependency names or an API questionnaire. Treat durations as recommendations, not enforced limits.

Proactively show where to choose a style: link the public GitHub catalogs shown below, explain that the user can watch samples and reply with a style code such as A3 or B1. Do not wait for "where do I choose?" or substitute an installed reference-file path for the public catalog. With no mode selected, show both links; with a known mode but no style, show only its relevant link. If a style is already supplied, acknowledge it and continue without requiring another catalog visit or selection. Only B1 is currently available for B; do not offer future placeholders such as B2 as ready choices.

### Choose the public catalog language

Resolve the guidance language using the priority above, then select its README from this table. Match regional variants to their base language (for example, `en-GB` → `en`, `fr-CA` → `fr`, `pt-PT` → `pt-BR`); the available Chinese catalog is Simplified Chinese. Do not use the host locale instead of a clear conversation language. An explicit request to view a particular README edition overrides only the catalog choice, not the guidance language.

| Guidance language code | Language | Public README |
|---|---|---|
| en | English | [README.en.md](https://github.com/kaomei/stickman-video-director/blob/main/README.en.md) |
| zh | Chinese | [README.zh-CN.md](https://github.com/kaomei/stickman-video-director/blob/main/README.zh-CN.md) |
| ja | Japanese | [README.ja.md](https://github.com/kaomei/stickman-video-director/blob/main/README.ja.md) |
| ko | Korean | [README.ko.md](https://github.com/kaomei/stickman-video-director/blob/main/README.ko.md) |
| fr | French | [README.fr.md](https://github.com/kaomei/stickman-video-director/blob/main/README.fr.md) |
| pt | Portuguese | [README.pt-BR.md](https://github.com/kaomei/stickman-video-director/blob/main/README.pt-BR.md) |
| tr | Turkish | [README.tr.md](https://github.com/kaomei/stickman-video-director/blob/main/README.tr.md) |
| id | Indonesian | [README.id.md](https://github.com/kaomei/stickman-video-director/blob/main/README.id.md) |

Append `#a-styles` for the Director catalog and `#b-styles` for the Autopilot catalog; these anchors are shared by every listed edition. Localize the visible link labels as well as choosing the right destination. For an unsupported language, keep the guidance and link labels in that language but use `README.en.md` for the catalog. Do not invent a translated filename or anchor, or silently fall back to Chinese.

For example, English guidance links to [Director styles and samples](https://github.com/kaomei/stickman-video-director/blob/main/README.en.md#a-styles) and [Autopilot styles and samples](https://github.com/kaomei/stickman-video-director/blob/main/README.en.md#b-styles), even on a Chinese-language host. The Chinese welcome below uses the Chinese edition because its guidance is Chinese; do not copy its destinations unchanged into other languages.

Adapt this Chinese example to the actual environment and installation status:

### 欢迎使用火柴人视频 Skill

给我一个话题、需求、文章链接或故事脚本，就可以开始。**不用先写好完整文案**，我会帮你整理内容，再按你选的模式往下做。一次安装即可使用下面两种模式。

**画风在这里选择：**[导演模式画风一览](https://github.com/kaomei/stickman-video-director/blob/main/README.zh-CN.md#a-styles) · [全自动模式画风一览](https://github.com/kaomei/stickman-video-director/blob/main/README.zh-CN.md#b-styles)。打开看样片，选好后把画风编号（如 **A3** 或 **B1**）告诉我即可，不用下载画风包或重新安装。

#### A · 导演模式：先拿分镜和提示词，自己掌控生成与剪辑

- **适合做什么**：TikTok / Shorts、反转短剧、需要人物互动和具体动作的故事；可以先做 30 秒，也适合 1～3 分钟短片。
- **你会拿到什么**：故事提案、分段旁白、画面分镜，以及可以逐条复制使用的视频生成提示词。
- **需要准备什么**：在支持 Skill 的 AI 助手里和我沟通；生成视频时使用 Google Flow 等工具，最后在剪映等软件里完成剪辑。写提案和提示词不需要先配置 API。
- **怎么进行**：给话题和需求 → 我给故事提案 → 你确认或修改 → 按需确认人物三视图 → 我给逐段分镜提示词 → 你生成片段并剪辑。

**可选：先定人物，再做分镜。** 想让人物更一致，或做专属形象的视频，可以先设计符合所选画风的火柴人，确认三视图（正面、侧面、背面）。已有确认的角色参考图可直接复用，不需要定制时可跳过。生成每段视频时，在支持参考图的工具中都附上已确认的角色图；参考图是额外辅助，不替代原有提示词，也不改变画风规则，最终仍需检查各段人物是否一致。

可以直接这样说：

```text
使用导演模式/A模式，把下面的话题、文案或需求做成火柴人视频：
[填写话题、粘贴文案，也可以直接描述需求]
需求：横屏 16:9，采用 A3「史前洞穴风」，先做 30 秒。
先给我导演提案，确认后再输出逐段视频提示词。
```

如需专属角色，可以再补一句：“先帮我设计符合所选画风的火柴人，确认三视图，再给分镜提示词。”

#### B · 全自动模式：确认样片后，自动做完整视频

- **适合做什么**：YouTube 知识讲解、产品宣传、故事解说和连续故事短剧；可以先试 20 秒，再做 5～10 分钟或更长的内容，不用逐段手动拼装。
- **你会拿到什么**：配好旁白、字幕、微动画和音效的完整 MP4 视频，以及字幕文件。画面以插画、重点文字和微动画配合讲述。
- **需要准备什么**：在 Codex、Claude Code 等能操作文件、执行命令的环境中使用；还需要可用的生图、配音服务，以及把素材合成视频的本地工具。我会先检查已有配置，只带你补缺少的部分。
- **怎么进行**：给内容和需求 → 检查配置 → 确认脚本、画风和声音 → 看约 20 秒有声样片 → 确认后自动制作整片 → 拿到视频文件。

两种模式都可在**你确认成片满意后**，选择继续制作匹配当前画风的封面、标题、简介与置顶评论；也可以直接结束。不需要重新选模式或复制一套提示词；可用的生图工具与费用会另行确认，发布账号不会被自动操作。

可以直接这样说：

```text
使用全自动模式/B模式，把这篇文章做成适合 YouTube 的 5 分钟宣传视频。
横屏 16:9，用 B1「极简手绘风」，英文旁白，配好字幕和音效。
先帮我检查生图、配音和视频合成配置，再给我脚本与 20 秒有声样片。
文章链接：[粘贴链接]
```

#### 现在怎么开始？

直接发来**内容＋想拿到的结果**就行，例如：“我想做一个介绍这个工具的 YouTube 视频，希望自动拿到完整成片。”也可以补充时长、横竖屏、画风、语言和音色；没想好的部分，我会接着引导，不需要一次填完所有选项。A 模式的旁白和声音设计沿用原有规则；B 模式按所选画风配置字幕和配音，B1 默认英语和 Google Gemini 的 Bodi 音色，你也可以指定其他语言、平台或音色。不同 B 画风可以有各自的默认配置，但都会配好旁白和字幕。

如果工具还没配好，可以先说：**“我想用全自动模式，但不知道怎么配置，先帮我检查。”** 我会说明哪些能用了、哪些还缺，以及具体怎么补；涉及收费的生成会先说明，不会因为安装好了就直接开始付费制作。

### Adapt instead of replaying the README

If the user's deliverable or mode is already clear, acknowledge it in one sentence, explain only the relevant mode's output/preparation/next stage, and continue with its first incomplete stage. Do not send the full two-mode tutorial to a user who already gave a complete brief or asked to skip it. Do not make the user choose A/B again, paste their source again, or answer questions already resolved. If the brief is complete, proceed rather than waiting for "start". Installation alone is not authorization for paid generation or full production.

## Progress at each substantive stage

After a real stage completes, or when something blocks it, give a compact update in the conversation language. Usually use three short lines, adapted to the situation:

- **已完成**：the concrete output or check, with its link/path when useful. Distinguish checked, user-approved and still unverified.
- **还缺什么**：only the actual missing input, configuration, permission or acceptance; say "无" if there is none. Group missing choices in one concise question. Do not invent blockers to fill the format.
- **下一步**：state what the assistant will do next and, only if needed, exactly what the user must supply or confirm. Give a useful reply example when it saves effort.

Make these lines useful to a beginner: identify the missing item's role, who will handle it and the smallest concrete action. "配音未配置，请配置后继续" is not enough. After checking the selected service, explain its actual supported connection/login or environment-variable setup, and show how to report completion without asking for secret values. Do not invent account screens, commands, service availability or check results. If multiple things are missing, show the checklist but lead with one actionable next step; expand details when the user reaches it rather than dumping every setup manual at once.

For example, after a real preview is ready, link it and give an explicit review handoff rather than merely saying "waiting for confirmation":

> 已完成：约 20 秒有声样片已生成，已检查画面、字幕和音效轨；[播放样片]应替换为真实文件链接。
> 还缺什么：请你观看并试听，确认人物和画风、配音、字幕与切镜节奏是否合适。
> 下一步：需要调整，直接说哪处不对；满意后，可以回复“这版样片通过”。我会结合此前授权和已说明的费用确认能否继续整片，不需要你逐段拼装。

The example is not a canned claim: report only checks actually completed, insert the real playable file, and separately disclose any remaining full-production cost/authorization. A sample's user approval does not fill a missing cost approval.

These are stage handoffs, not per-command logs or recurring reminders. When no user action is needed and the next step is authorized, continue doing it in the same turn. Stop only at the mode's existing approval gates or a genuine blocker. Do not ask permission again for every scene, file or command. At an approval gate, name what is being approved; a generic "continue" must not silently become approval of an unseen sample or new costs.

## A · Director handoffs

The table and optional-reference sections below retain the A1–A5 workflow. When A6 is selected, use [A6 selection and production guidance](amber-noir.md) instead. Do not present its execution-route explanation before selection or replay the generic welcome afterward.

| Stage | What to explain / next action |
|---|---|
| Brief | Reuse source, ratio and style/theme already supplied. Ask for missing required items together. Duration defaults to 60 seconds under the existing Director contract. Do not require Node, FFmpeg, an API key or service login merely to produce a proposal or prompts. |
| Proposal | Deliver the current storyboard, narration and visual/voice plan. Say that approval of this proposal is still needed; invite a specific change or confirmation, then stop. Topic approval is not proposal approval. |
| Prompt package | After approval, deliver independently usable clip prompts and stitching guidance. Explain that these are prompts, not generated video files. Next, the user generates clips in a supported video tool and edits/assembles them; offer targeted help if a clip needs correction. |

Keep all existing setup, style, voice and revision rules unchanged. A global change returns to the proposal gate; explain what changed instead of restarting already valid setup.

### Optional A character references

Character references are optional support for stronger visual consistency or a personalized character, not a new setup requirement for all A users. Explain the option in first-use guidance; if the user has not chosen it, continue the ordinary Director workflow without blocking on a three-view sheet or adding an approval gate. This section is A-only; it does not impose a reference workflow on B.

When chosen, help define a character within the selected A style's permitted variations and confirm front, side and back views before delivering final clip prompts. Reuse suitable user-approved references rather than requiring new images. Include the character/reference plan in Phase A; a reference that changes an already approved global design follows the existing proposal-revision rule. Keep fixed style anchors, anatomy and character constraints intact: do not silently override them to copy an incompatible reference. Explain any conflict and resolve it with the user.

At prompt handoff, explain that the user attaches the approved character image(s) as a separate reference input for **every generated clip** when the chosen tool supports reference images. Verify the actual tool's support rather than promising that every platform accepts them. If unsupported, explain the limitation and offer a compatible tool or the unchanged text-prompt path. A reference can help, but is not a consistency guarantee; inspect the resulting clips.

Keep the original validated prompt templates, full style/cast anchors and frozen voice blocks as required by the selected A style. References supplement those prompts, not replace, shorten or globally rewrite them. Personalize only within that style's allowed choices, not by changing a fixed character anchor; do not import B's TTS rules or add a generic character-description block to all A prompts.

### A5 proactive character guidance

When A5 / Style 5 / Historical Cartoon is selected, proactively give this recommendation before planning, even if the user has not asked about consistency. Use the conversation language; do not hide it in a FAQ or wait for a failed generation. For example:

> 使用 A5 时，建议你先自行生成人物三视图（正面、侧面、背面），确认满意后，再做视频。在支持参考图的视频工具里，生成每段视频时，都把角色参考图和该段完整分镜提示词一起提交。只靠文字提示词，人物一致性可能不够稳定；参考图有助于保持形象，但不能保证完全一致。已有满意的角色图可以直接复用。

Explain that this is recommended, not a new mandatory setup or approval gate. If the user prefers text-only or skips character design, briefly acknowledge the consistency limitation and continue the existing Director workflow. Once this choice is known, do not repeatedly ask or repeat the warning at every clip. Suggest three views again only for a new character or a material design change.

The default A5 behavior is advice only: remind the user to generate their own reference images. Do not bundle or supply reference images, automatically generate them, require an upload, or wait for a three-view approval before delivering the ordinary proposal and prompts. Generate or review references only when the user explicitly requests that additional work; that request does not waive the host's generation permissions or cost approval. Reuse suitable approved character images when the user provides them instead of requiring new ones. This A5-specific boundary takes precedence over the general optional-reference help above.

At handoff, retain the full standalone style, cast, action and voice instructions. If references are being used, remind the user to attach their confirmed character image(s) to every clip; name specific files only when actually supplied. A reference is an additional image input, not a replacement for the prompt or permission to change A5's drawing rules. Check the chosen model/mode actually supports character-reference images; do not assume that accepting a first-frame image is the same as supporting a multi-view reference sheet, or force a multi-panel sheet to become the opening shot. Offer a supported reference workflow or the text-only path with its limitation. Do not claim guaranteed identity or stable text-to-video: recent cross-country text-only trials still showed missing hair and disconnected heads despite explicit prompt constraints.

## B · Autopilot handoffs

Read [Autopilot](autopilot.md), its [runtime configuration](autopilot-runtime.md) and the selected B-style reference before production.

### 1. Brief and source

Resolve the topic/source, audience, purpose, duration, ratio, B-style and narration choices. Accept a topic, requirement, article/post/news link or script; the user need not write a story first. Use supplied choices; propose reasonable creative details for confirmation rather than presenting a long blank questionnaire. If a link cannot be read, ask for its text or screenshots and explain what source material is still missing. Never fill the gap with invented facts.

### 2. Configuration check

Run the documented local `doctor` check and inspect the user's chosen image and voice services. Resolve each setting as **explicit user choice → selected B-style default → B common fallback**, as defined in Autopilot. Check that resolved provider/voice first; for new B1 projects without a user override this is Google Gemini/Bodi. Do not ask the user to choose a platform again merely because they accepted defaults. Summarize actual findings in plain language, separating **ready**, **missing** and **not yet verified**:

- Local composition: Node 20+, FFmpeg/FFprobe, renderer dependencies and suitable fonts. If something is missing, name that component, explain its role briefly, and give the next platform-appropriate installation/configuration step. Install project dependencies only with the host's normal permissions; after a repair, verify the affected check again.
- Image and voice generation: reuse an available configured tool or authenticated interface if suitable. Do not demand a Gemini API key when the chosen browser/native tool does not use one. If image generation is not configured, guide selection of an available image service. For narration, check the resolved provider/voice and explain only the missing login, access or configuration; do not require Bodi when the user or selected style specifies another voice. For API adapters use environment variables, never pasted secret values. Do not silently replace the selected voice/service with local OS TTS.
- Evidence and cost: `doctor` checks local dependencies and key presence, not login, model access, quota or billing. Report those as unverified unless separately checked; an account subscription or an environment variable alone does not make generation ready. Disclose the planned billable calls/cost and obtain authorization before making them. Do not make a paid test call simply to populate the checklist.

State the smallest next fix, not just "configuration failed" or a raw terminal dump. For example:

> 已完成：本地合成工具检查通过，已确认横屏 16:9 和 B1 极简手绘风。
> 还缺什么：生图服务尚未选择；默认 Google Gemini/Bodi 的模型访问和额度还未验证。
> 下一步：先确认使用哪种生图工具；配音按默认 Bodi 路径继续检查，只有缺少访问权限或配置时再带你补齐。暂不调用付费生成，脚本可以先继续准备。

If the host cannot read/write files or execute commands, explain that Autopilot cannot render here and offer a compatible environment or Director mode. Do not silently switch modes or call a prompt package a finished film.

### 3. Script, character and voice plan

Show the short outline/script, design, caption treatment and voice choices required by Autopilot. State what needs confirmation before generating media, and identify any service/cost blockers still open. Follow the settings order above; B1's caption and voice defaults do not constrain another B style. Verify the selected provider/model/voice as described in Autopilot; check Bodi availability only when Bodi is selected. Narration and synchronized subtitles are required. Carry the approved voice and assets forward unchanged.

For B, explain the selected service/model and named voice, not a custom descriptive voice profile. Use that voice as provided with no added style/direction instructions; follow Autopilot's voice-led rule for every B style.

### 4. Approximately 20-second sample

Make and inspect the representative sample with narration, subtitles, acting/micro-animation and SFX. Only the sample range needs finished shots/media at this stage. Link the playable result. Say what was technically checked and ask the user to review the actual picture and sound. Request approval of this exact sample and authorization for the remaining production, with any remaining cost explained. Do not run `approve` based on technical success alone. If revisions are requested, keep valid audio/assets and revise only the affected scope; update the preview/approval when its scoped fingerprint changes, not merely because later shots were completed. Changes to the approved script, global settings or cost still need the corresponding authorization.

### 5. Full production and delivery

After genuine sample/full-production approval, render the rest with pictures following the approved original-speed narration. Give updates at meaningful production stages; do not wait for a new confirmation after each shot. On interruption or failure, explain completed outputs and the exact blocked step, inspect existing jobs/cache and resume valid work rather than resubmitting blindly.

Deliver MP4, subtitle sidecars and project/checkpoint paths with a short verification summary. If any check, listening review or output is still missing, say so; do not call a partial file a complete film. End with the useful next action (for example, review the film or request a specific revision), not automatic publication, a new video or another paid call.

## Optional finishing after video approval

For both modes, apply [Thumbnail & Publishing Kit](thumbnail-publishing-kit.md) after the user confirms the final video, or when they explicitly request packaging. Offer it once in the conversation language, unless already accepted, declined or deferred. Do not offer it merely because a proposal, A prompt package or B sample was approved, or a render passed technical checks. For A, the external edit is complete only when the user says so; request the final cut/timeline only if needed for the requested checks or timestamps, not to make the optional offer. For B, delivery of an MP4 is not final user acceptance.

Use a short handoff such as: “这版视频确认没问题了。要不要顺便生成匹配当前画风的封面，以及标题、简介、置顶评论和发布前检查清单？” If the user explicitly requests packaging earlier, use the approved script for drafts and mark final-cut-dependent items pending. Skipping ends the task normally and never withholds the video. Keep all production, revision and cost approvals unchanged.
