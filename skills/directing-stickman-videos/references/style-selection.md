# Choose a style in chat

- If the user wants to make a video but has yet to pick a style, start the reply with the picker. If they chose an engine, show its group. Otherwise, or if they ask for all styles, show both. Show the full list for each displayed group in ID order, with equal emphasis. A story brief or a request for a plan still starts with the same picker. Recommend a specific style only when the user explicitly asks for a recommendation.
- Before each displayed group's style choices, briefly introduce its engine and recommended tools in the conversation language using the wording below. Skip the comparison table. Explain setup, costs and production steps when the user reaches them or asks.
- In image-capable chats, directly attach or embed the bundled style chart for each shown engine using the host's supported image mechanism. Each chart shows thumbnails, style IDs, names, visual characteristics and suitable topics. Use the charts below for English and Simplified Chinese, give them meaningful alt text, and avoid repeating their contents in a table. No image generation or screenshots are required. If a chart cannot be displayed or omits an available style, show the current text choices. For other languages, show the text choices in the conversation language and embed the matching individual thumbnails from `../assets/style-previews/` if supported (for example, `a3.jpg`). Never show unusable local paths.
  - English: [A1–A8](../assets/style-previews/a.en.jpg) · [B1–B8](../assets/style-previews/b.en.jpg).
  - Simplified Chinese: [A1–A8](../assets/style-previews/a.zh-CN.jpg) · [B1–B8](../assets/style-previews/b.zh-CN.jpg).
- In a text list, give each style's ID, name, visual characteristics and suitable topics on one compact line. Use the wording below for English and Simplified Chinese. For other languages, use the corresponding README's style names when available and translate both the description and topics. Invite the user to reply with a style ID or name using a neutral line such as “选好后，回复画风编号或名称即可。” Wait for their choice before drafting the storyboard. The style determines the engine.
- End every picker reply with a clickable link to the public GitHub README for full video samples, even when the charts are visible. For both groups use [画风与完整样片](https://github.com/kaomei/stickman-video-director/blob/main/README.zh-CN.md#style-gallery) in Simplified Chinese or [Styles and full samples](https://github.com/kaomei/stickman-video-director/blob/main/README.en.md#style-gallery) in English. Follow the [README language routing](getting-started.md#choose-the-public-catalog-language) for other languages. For a single group replace `#style-gallery` with `#a-styles` or `#b-styles`. The thumbnails help users browse; generation references and initial frames follow the selected style's production rules.
- If a supported style is already chosen by name or ID, or set for the current project, go directly to its first unfinished production step. Ask only about unresolved requirements. If wording could mean more than one style, offer the matching choices. Installation and configuration requests continue through [first-use guidance](getting-started.md).

## Engine introductions

- **A · Model Engine** — Describe the visuals and action in a prompt, and a video model generates the clip. We recommend Google Flow for video generation.
- **B · Code Engine** — An agent with strong coding capabilities uses code to animate layers such as characters, backgrounds, and props. We recommend Codex or Claude Code.

- **A · Model Engine（模型引擎）** — 用提示词描述画面和动作，由视频模型生成片段。推荐使用 Google Flow 生成视频。
- **B · Code Engine（代码引擎）** — 用代码控制人物、背景和道具等图层来制作动画，需要编程能力较强的 Agent。推荐使用 Codex 或 Claude Code。

## A · Model Engine

| ID | English | 简体中文 | Short description | 画风简介 | Good for | 适合题材 |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Classic Black & White | 经典黑白风 | Black or white backdrops with bold visual metaphors. | 纯黑或纯白背景、极简线条与鲜明的视觉比喻。 | Science concepts, personal growth, business explainers | 科学概念、心理成长、商业拆解 |
| A2 | Modern Pop | 现代潮酷风 | Crisp tech graphics or vivid colors with snappy motion. | 清爽的科技图形或高饱和彩色场景，搭配利落动效。 | AI tools, tech products, colorful adventures | AI 工具、科技产品、彩色冒险 |
| A3 | Prehistoric Cave | 史前洞穴风 | Rough ink lines, cave-wall textures, and broad reactions. | 粗粝墨线、洞穴壁画质感与夸张的史前角色表演。 | Workplace satire, dark comedy, fables | 职场讽刺、黑色幽默、寓言 |
| A4 | Cozy Storytelling | 治愈故事风 | Soft light and subtle gestures in everyday settings. | 柔和光线和细微动作，带出日常故事的温度。 | Everyday feelings, relationships, coming-of-age stories | 生活共鸣、人际关系、成长故事 |
| A5 | Historical Cartoon | 历史卡通风 | Bold outlines, expressive faces, and colorful period sets. | 大胆轮廓、鲜明表情和多彩的历史场景。 | World history, past civilizations, everyday life in history | 世界历史、文明趣事、古人日常 |
| A6 | Amber Noir | 暖金暗影风 | Amber light and deep shadows create cinematic suspense. | 暖金光源和深色阴影，营造电影感的悬疑氛围。 | Thrillers with twists, what-if stories, modern fables | 悬疑反转、如果类脑洞、现代寓言 |
| A7 | Rubber Hose Animation | 橡皮管动画风 | Vintage painted sets and springy physical comedy. | 复古手绘布景配上弹性肢体和夸张喜剧动作。 | Absurd comedy, everyday fables, music-led shorts | 荒诞喜剧、生活寓言、随音乐节奏展开的短片 |
| A8 | Studio Ghibli | 吉卜力画风 | Bright hand-painted landscapes and lively movement. | 明亮的手绘风景与轻快、富有生机的角色动作。 | Journeys, everyday adventures, stories about work | 旅途、日常冒险、职业故事 |

## B · Code Engine

| ID | English | 简体中文 | Short description | 画风简介 | Good for | 适合题材 |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Minimal Line Art | 极简线稿风 | Simple ink drawings and key text on a near-white canvas. | 近白底上的手绘线条和重点文字，让讲解一眼看懂。 | Educational explainers, science, product demos | 知识解说、科普、产品介绍 |
| B2 | Colorful Hand-Drawn | 彩色手绘风 | Colorful everyday settings, fine lines, and gentle motion. | 彩色日常场景、细墨线和轻微动画。 | Sleep, habits, everyday psychology | 睡眠、习惯、日常心理 |
| B3 | Retro TV | 复古电视风 | Dark screens, glowing figures, and subtle TV scanlines. | 暗色屏幕、发光人物和复古电视扫描线。 | Curious facts, animal behavior, short mysteries | 冷知识、动物行为、短篇悬疑 |
| B4 | Survival Thriller | 求生短剧风 | Stark light and shadow turn familiar places eerie. | 强烈明暗和场景细节，把日常空间变成悬疑现场。 | Survival rules, urban legends, disaster escapes | 求生规则、都市怪谈、灾难逃生 |
| B5 | Avatar Explainer | 角色解说风 | A recurring illustrated host, bold type, and metaphors. | 固定的插画主持人搭配醒目文字和视觉比喻。 | Host-led explainers, pop culture, humorous commentary | 固定角色的知识解说、流行文化、趣味评论 |
| B6 | Meme Story Animation | 动感 Meme 风 | Exaggerated faces and quick cuts land the punchlines. | 用夸张表情和快速切镜带出剧情笑点。 | Strange history, scam stories, comedies with twists | 历史奇闻、骗局故事、反转喜剧 |
| B7 | Pixel Theater | 像素剧场风 | Pixel characters act in game-inspired settings. | 像素角色在游戏化场景里行动，让剧情随动作推进。 | Life choices, game-inspired fables, dark comedy | 人生选择、游戏化寓言、黑色幽默 |
| B8 | Greek Mythology | 希腊神话风 | Hand-painted mythic settings, warm golden light, and expressive 2D characters. | 手绘质感的神话场景、暖金光影和表情鲜明的二维角色。 | Greek myths, legends, fables about power and fate | 希腊神话、传奇故事、权力与命运寓言 |
