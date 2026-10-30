<div align="center">

[🇺🇸 EN](README.en.md) · [**🇨🇳 简中**](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**将任何脚本变成适合不露脸 YouTube 频道的多画风爆款火柴人动画视频。完全开源。**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

从一个话题、一篇文章或一份脚本开始，自动编排画面、配音、字幕与音效，制作可直接发布的火柴人视频。

**⚡ 100% 免费开源。无需出镜，无需每月 $50 的订阅，几分钟就能完成，不必等上几天。**

画风持续更新，适用于 **科学科普、暗黑心理学、科技寓言、热门奇闻与故事类频道。**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>经典黑白风</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="经典黑白风火柴人动画：黑底白线、动态科普" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>现代潮酷风</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="现代潮酷风火柴人动画：红帽角色、科技光效" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>史前洞穴风</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="史前洞穴风火柴人动画：洞穴故事、反转短片" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>治愈故事风</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="治愈故事风火柴人动画：彩色场景、生活共鸣" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>历史卡通风</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="历史卡通风火柴人动画：江户日本的武士故事" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>极简手绘风</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="极简手绘风火柴人视频：生动角色、重点文字与微动画" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>暖金暗影风</strong><br>
<a href="#a6"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-flow.gif" alt="暖金暗影风火柴人动画：暖光与深邃暗影中的城市，主角身穿橙色连帽衫" width="90%"></a>
</td>
<td width="50%" align="center">
<a href="#a7"><strong>敬请期待…</strong></a>
</td>
</tr>
</table>

<div align="center">

**7 大画风 · 9 种视觉方案 · 实测样片 · 免费开源**

⭐ **为项目点个 Star，及时关注下一批画风和新功能解锁。**

[开始使用](#quick-start) · [导演模式画风](#a-styles) · [全自动模式画风](#b-styles) · [常见问题](#faq) · [路线图](#road-to-10000-stars--creator-ecosystem)

</div>

<a id="creation-modes"></a>

## 🎬 两种视频制作模式

**想掌控每个镜头？选择 A · 导演模式。想拿到完整视频，不想自己拼接场景？选择 B · 全自动模式。** 一个项目，两种工作流。

|  | <div align="center">A · 导演模式</div> | <div align="center">B · 全自动模式</div> |
|:---:|:---|:---|
| **特点** | **你来掌镜，AI 做导演**：生成分镜与提示词，由你控制片段生成和剪辑。 | **给出话题或需求，直接拿成片**：自动完成插画、配音、字幕、微动画与视频合成。 |
| **时长** | **短片优先**，如 30 秒–3 分钟；也可逐段制作更长内容。 | **长片优先**，尤其适合 **10 分钟及以上**的旁白视频，也能做短片和连续故事短剧。 |
| **工具** | 用支持 Skill 的 AI 助手规划分镜，在你偏好的视频生成工具中生成片段（Google Flow、Runway、Luma、Kling 等），再用 CapCut 或 Premiere 完成剪辑。 | 在 **Codex、Claude Code** 等能读写文件、调用工具和执行命令的 AI 编程代理中运行，串起素材生成与本地合成。 |
| **画面** | **逐段生成动画**：侧重角色动作、镜头调度与人物互动。 | **插画分镜＋微动画**：用切镜、推拉和平移配合旁白讲故事，不必逐段生成完整动作视频。 |
| **产出** | 导演提案、分镜、逐段视频提示词与声音设计。 | **带配音、字幕与微动画的完整视频文件**。 |
| **开始** | <div align="center"><a href="#director-start">使用导演模式</a></div> | <div align="center"><a href="#autopilot-start">使用全自动模式</a></div> |

两种工作流都可以从一个初步话题、一个网页链接或一份完整脚本开始。画幅（9:16、16:9、1:1）、旁白语言与配音均可自由选择。上面的时长仅供参考，不是硬性限制。

💡 **快速配置说明**：

- **导演模式**可在普通对话式 AI 窗口中使用。
- **全自动模式**运行在具备文件和终端访问能力的 AI 编程代理中（如 **Claude Code、OpenAI Codex 或 Cursor**），自动完成从渲染到文件交付的全流程。

<a id="quick-start"></a>

## 🧭 开始使用

兼容 Claude Code、Codex、Cursor、Antigravity，或任何具备文件和终端访问能力的智能体环境。

把以下内容发送给你的 AI 助手：

```text
帮我安装这个 Skill：
https://github.com/kaomei/stickman-video-director

安装成功后，立即读取已安装的 SKILL.md，
用易懂的方式介绍两种模式的产出、所需工具和制作流程，
给我可以照着说的示例；
结合我的需求，告诉我还缺什么、下一步具体怎么做。
```

<a id="director-start"></a>

### A · 导演模式：逐段生成分镜提示词

安装后，把下面这段发给 AI 助手，换成自己的话题即可：

```text
使用导演模式/A模式，把下面的话题、文案或需求，
做成火柴人视频：
[填写话题、粘贴文案，也可以直接描述需求]

需求：横屏 16:9，采用 A3「史前洞穴风」，先做 30 秒。
先给我导演提案，确认后再输出逐段视频提示词。
```

**流程：给出话题和需求 → 生成故事脚本 → 按需确认人物三视图 → 生成详细分镜提示词 → 手动生成片段并剪辑成片**

提案包含故事结构、分段旁白、画面动作、镜头和声音设计。拿到提示词后，将它们逐条复制到 [Google Flow](https://flow.google.com/) 等视频生成工具，再用剪映等工具添加字幕、完成剪辑。

制作第一个视频时，请参考 [X 上的可视化制作教程](https://x.com/CrazyKaomei/status/2102311241046008268)（含分步视频演示的串帖）。

<a id="autopilot-start"></a>

### B · 全自动模式：一句话生成长片

在 Codex、Claude Code 等具备文件与命令执行能力的环境中，安装后这样说：

```text
使用全自动模式/B模式，把下面的话题、文章、帖子、新闻或具体需求，
做成在 YouTube 上有吸引力的视频：
[粘贴内容或链接，也可以直接描述宣传需求]

需求：5～10 分钟，横屏 16:9，采用 B1「极简手绘风」，配上旁白、字幕和音效。

先检查生图、配音和视频合成配置，再给我脚本与 20 秒有声样片；
确认后，让画面跟随配音节奏自动完成整片，交付完整视频文件，不用我逐段拼装。
```

**流程：给出话题、内容或需求 → 确认视频脚本 → 确认 20 秒有声样片 → 自动制作整片 → 拿到完整视频**

AI 助手会根据内容设计分镜，生成画面与旁白，配好字幕和音效，再按配音节奏合成为完整视频。你主要负责确认脚本和样片，不用逐段生成、手动拼装。

首次使用会先检查所需配置，缺什么、怎么补都会逐步说明。画面或声音不满意，可以只调整对应片段，保留已经确认的部分。

**两种模式都可选的收尾步骤：**确认成片满意后，可继续制作[封面与发布工具包](#thumbnail-publishing-kit)，获取匹配画风的封面和上传文案，也可以直接结束。无需切换模式或重新安装。

<a id="style-gallery"></a>

<a id="a-styles"></a>

## 🎨 A · 导演模式画风一览

按 A1、A2、A3…更新，每个画风下展示对应的动画样片。

<a id="a1"></a>

### A1：经典黑白风

用最少的线条，把一个概念讲清楚。纯白或纯黑的画布上，人物、道具和强调色承担主要信息，适合做节奏明快的知识解说。

- **画面特点**：简洁圆头、线条肢体与统一线宽，可偶尔加入简单表情；最多三种高饱和强调色，用来区分情绪、风险或行动。抽象内容可以变成具体画面，比如把焦虑画成牢笼，把注意力画成进度条。
- **适合内容**：科学常识、心理成长、励志、自我管理、商业拆解与概念解释。
- **怎么选**：白底黑火柴人清爽直观，适合教学和日常科普；黑底白火柴人对比更强，适合悬念、冲突和情绪表达。

| A1.1 · 白底黑火柴人 | A1.2 · 黑底白火柴人 |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1 · 白底黑火柴人动态演示" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2 · 黑底白火柴人动态演示" width="360"><!-- demo:dark:end --> |
| 纯白画布 · 黑色人物 | 纯黑画布 · 白色人物 |

---

<a id="a2"></a>

### A2：现代潮酷风

红色冷帽、黄色 T 恤，是这套画风最鲜明的角色标记。既可以在干净的科技空间里讲产品，也可以走进卧室、街道和荒野，演一段有起伏的故事。

- **画面特点**：固定红帽黄衣的极简角色，搭配两种环境。极简科技方案用纯白空间、极淡网格、悬浮玻璃界面和青蓝光效表现科技感；彩色故事方案用彩色场景、光影和空间纵深营造故事氛围。
- **适合内容**：极简科技适合 AI 工具、科技产品、方法教学与功能解说；彩色故事适合成长经历、生活话题、冒险与励志故事。
- **怎么选**：重点是“讲清一个工具或方法”，选极简科技；重点是“跟着角色经历一件事”，选彩色故事。

| A2.1 · 极简科技 | A2.2 · 彩色故事 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1 · 极简科技风动态演示" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2 · 彩色故事风动态演示" width="360"> |
| 纯白空间 · 极淡网格 · 青蓝微光 | 彩色场景 · 电影光影 · 叙事氛围 |

---

<a id="a3"></a>

### A3：史前洞穴风

把今天的烦恼，搬回没有手机和办公室的史前世界。洞穴、兽皮、篝火和夸张表情，让职场、人性与生活里的荒诞，变成一段带反转的小故事。

- **画面特点**：粗手绘线条、白色实心头部、深色肢体、兽皮服饰和土色环境，强调角色互动、表情反应与喜剧停顿。角色按故事设计，男女老幼都可以出现，不同故事不必共用一张脸。
- **适合内容**：史前脑洞、职场讽刺、人性观察、黑色幽默、寓言与儿童英语故事。
- **怎么选**：想用一个小情节讲出“原来如此”或“怎么会这样”的反转，可以选这一风格；尤其适合把现代关系放进原始部落，做出熟悉又意外的笑点。

| 案例 1：《人类的第一份工作是怎么来的？》 | 案例 2：《人类第一次发现火源》 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="《人类的第一份工作是怎么来的？》动态预览" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="《人类第一次发现火源》——粉丝作品" width="360"> |
| 史前故事 · 职场反转 | 火源主题 · 粉丝作品 |

---

<a id="a4"></a>

### A4：治愈故事风

一只舍不得用的杯子，一条忍不住秒回的消息，一个终于留给自己的下午。让极简角色走进彩色的日常场景，用动作、表情和镜头讲普通人能共鸣的小事。

- **画面特点**：白色实心圆头与细长躯干、深色细肢体和自然的小表情，搭配完整的 2D 卡通环境。全景交代地点，近景捕捉犹豫或释然，跟拍带着角色继续向前。
- **适合内容**：生活共鸣、心理成长、人际关系、温暖故事、习惯养成与儿童英语。
- **怎么选**：想让观众从一个具体生活片段里认出自己，可以选这一风格。色彩和光影随主题变化，既能表达温暖，也能讲焦虑、疲惫和重新出发。

| 案例 1：通勤路上的消息焦虑 | 案例 2：把时间留给自己 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="治愈故事风：地铁站里的消息焦虑" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="治愈故事风：露天咖啡座的休息时刻" width="360"> |
| 地铁站 · 行走跟拍 · 情绪近景 | 露天咖啡座 · 暖光树影 · 日常动作 |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5：历史卡通风

让火柴人走进历史：江户街头的武士、古埃及神庙里的黑猫、罗马营地中的士兵。用鲜明的时代服饰、彩色场景和带反差的小情节，把历史知识讲得更有画面感。

- **画面特点**：白色实心圆头、黑色椭圆眼睛、清晰粗轮廓与细线肢体，搭配时代服饰、柔和赛璐璐明暗和彩色绘景。换国家、换时代时，调整服装、建筑、道具和音乐，保留同一套角色画法。
- **适合内容**：世界历史、文明趣事、古人日常、人物故事与历史题材的幽默短片。
- **怎么选**：想把知识点变成“古人正在经历的一件事”，可以选这一风格。既能讲一个历史细节，也能用角色反应和情节反转，让观众愿意继续看。

| 案例 1：江户日本 · 武士的日常 | 案例 2：古埃及 · 猫与木乃伊 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="历史卡通风：江户武士与街巷日常" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="历史卡通风：古埃及神庙、黑猫与木乃伊" width="360"> |
| 江户街巷 · 武士服饰 · 日常反差 | 彩色神庙 · 黑猫角色 · 历史趣事 |

画风与提示词贡献：[Lawal Ridwan / @leksautomate](https://github.com/leksautomate)。

---

<a id="a6"></a>

### A6：暖金暗影风

暖金色灯光、深邃暗影，以及穿着橙色连帽衫的黑色圆头角色。把一个令人好奇的“如果”变成电影感小故事，用富有表现力的动作讲述，而不是让角色对镜头口播。

- **视觉风格**：暖琥珀色高光与深紫暗影形成对比，搭配简洁剪影、柔和明暗的城市场景和克制的镜头运动。
- **适合内容**：“如果”主题、心理学、现代寓言、意外发现，以及带反转的短故事。
- **适合这样选**：你想用电影感动画场景搭配独立旁白。在支持浏览器操作的智能体中，确认后的片段可以继续组装，加入配音、音效、醒目的全大写字幕和简洁的白色标题。

| 示例 1：如果所有东西都便宜一万倍？ | 示例 2：值得跑去抢的好价 |
|:---:|:---:|
| <a href="assets/readme/style-6-amber-noir-mcp.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-mcp.gif" alt="暖金暗影风：物价一夜骤降的 20 秒故事" width="360"></a> | <a href="assets/readme/style-6-amber-noir-flow.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-flow.gif" alt="暖金暗影风：橙色连帽衫角色在商店外的 8 秒动画" width="360"></a> |
| Renoise MCP 示例 · 20 秒 | Google Flow 示例 · 8 秒 |

---

<a id="a7"></a>

### A7：待更新…

新的专用导演画风正在训练中。[为项目点个 Star](#road-to-10000-stars--creator-ecosystem)，一起在 5,000 Stars 时解锁！

---

<a id="b-styles"></a>

## 🤖 B · 全自动模式画风一览

按 B1、B2、B3…更新，每个画风下展示对应的插画分镜＋微动画成片，与 A 系列分开维护。

<a id="b1"></a>

### B1：极简手绘风

让画面跟着旁白推进。用表情生动的火柴人、彩色手绘道具和醒目的重点文字，把知识、故事或产品亮点讲得清楚又有趣。

- **画面特点**：近白纸底与极淡网格，黑色手绘线条搭配少量彩色道具；用表情、局部微动画、连贯转场和音效推动画面，重点文字突出信息，字幕配合旁白。
- **适合内容**：YouTube 知识讲解、心理成长、职场故事、教育科普与产品宣传。
- **怎么选**：想把一个话题、一段文案或故事脚本做成带配音、字幕的完整视频，可以选这一风格。画面跟随语音节奏编排，适合持续讲解和长篇叙事。

点击动图，查看或下载有声样片。

<table width="100%">
  <tr>
    <th width="50%" align="center">案例 1：不露脸做 YouTube</th>
    <th width="50%" align="center">案例 2：为什么没人看？</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="B1 极简手绘风案例 1：点击查看或下载不露脸的 YouTube 视频创作有声样片" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="B1 极简手绘风案例 2：点击查看或下载 Bodi 有声样片，含字幕、手绘角色与微动画" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">手绘角色 · 重点文字 · 微动画</td>
    <td align="center">Bodi 旁白 · 生动表情 · 微动画</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2：待更新…

新的全自动画风和程序化动画正在训练中。[为项目点个 Star](#road-to-10000-stars--creator-ecosystem)，一起在 5,000 Stars 时解锁！

<!-- thumbnail-publishing-kit:start -->
<a id="thumbnail-publishing-kit"></a>

## 🖼️ 高点击率封面与发布工具包

**视频做得再好，也要先让人愿意点开。** 动画完成后，在同一工作流中统筹与画风匹配的封面、高点击率标题和观众互动钩子。

适用于**导演模式与全自动模式**的一体化收尾工具包：围绕视频已确认的角色与画风设计视觉钩子，并配齐可直接发布的 YouTube 元数据。

<table width="100%">
  <tr>
    <td align="center"><a href="assets/readme/thumbnails/no-camera.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/no-camera.jpg" alt="NO CAMERA? — 表情生动的手绘火柴人与打叉的相机" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/first-job.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/first-job.jpg" alt="THE FIRST JOB — 史前角色面对巨大的石块障碍" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a5-samurai-taxes.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a5-samurai-taxes.jpg" alt="SAMURAI VS TAXES — 赛璐璐风武士、江户街景与木版画风衬线字" width="280"></a></td>
  </tr>
  <tr>
    <td align="center">一个简单问题，一个清晰符号。</td>
    <td align="center">用巨大的障碍建立故事悬念。</td>
    <td align="center">时代服饰、场景与标题字体相呼应。</td>
  </tr>
</table>

<table width="100%">
  <tr>
    <td align="center"><a href="assets/readme/thumbnails/a1-you-vs-you.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a1-you-vs-you.jpg" alt="YOU vs YOU — 小小的黑色火柴人面对巨大的自己，辅以克制的红色点缀" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a2-busy-vs-better.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a2-busy-vs-better.jpg" alt="BUSY ≠ BETTER — 红帽角色被工作流卡片淹没，与只专注一件事形成对照" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a4-3am-again.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a4-3am-again.jpg" alt="3AM. AGAIN. — 深夜刷手机、蓝色屏幕光与柔和手写字" width="280"></a></td>
  </tr>
  <tr>
    <td align="center">用悬殊的体型讲清一个冲突。</td>
    <td align="center">忙碌还是有效，一眼看懂。</td>
    <td align="center">有共鸣的场景，绘画光影与手写字。</td>
  </tr>
</table>

*所有封面构思都围绕经过验证的 YouTube 包装心理学设计：鲜明的视觉反差、清晰的轮廓，以及手机端易读的字体。*

### 工具包包含：

- **封面图片**: 1 张匹配已确认角色、画风、配色与核心冲突的 16:9 横版封面。有可用生图工具且所需费用获准后，直接生成图片。
- **5 个高点击率标题方案**: 兼顾搜索意图、好奇心缺口与广泛的观众吸引力。
- **YouTube Studio 简介与 SEO**: 包含主题摘要、相关标签，以及有最终成片或已核实时间轴支持的时间戳。
- **置顶评论互动钩子**: 1 个与视频相关、邀请观众真实交流的问题。
- **发布前检查清单**: 核对手机端安全区、对比度、内容准确性和素材权利审核状态，不保证通过 Content-ID 或获得平台变现资格。

### 如何触发：

你确认成片满意后，AI 助手会询问是否需要这个可选收尾包。同意即可继续，也可以跳过，不影响视频交付，无需复制提示词。你也可以直接说：

```text
为这个视频生成封面与发布工具包：
- 1 张匹配已确认画风的 16:9 横版封面图
- 5 个 YouTube 标题方案
- 简介、相关标签，以及有依据时提供的已核实时间戳
- 1 个用于置顶评论的互动问题
- 发布前检查清单，明确标注待核对项
```

*生图需要可用工具及必要的费用授权；工具不可用时，AI 助手会说明缺口，并先交付文字包。也可以在脚本确认后提前请求草稿，但依赖最终成片的检查仍会标为待核对。下载封面、按需将文案复制到 YouTube Studio 或 TikTok；不会自动上传或发布。*

<!-- thumbnail-publishing-kit:end -->

<!-- readme:reliability -->

<a id="faq"></a>

## ❓ 常见问题解答 (FAQ)

### Q1. 这真的是 100% 免费的吗？有没有隐藏收费？

是的。Stickman Video Director 采用 MIT 开源协议，100% 完全免费且开源，你可以自由用于个人创作或商业变现。不同于传统每月收取 $30–$60 昂贵月费的商业软件，本项目没有任何订阅费。你只需根据自己选择调用的第三方大模型服务（如 Google Gemini、Claude 或 ElevenLabs）按需支付官方 API 费用。

### Q2. 生成的视频可以在 YouTube 和 TikTok 上开通收益变现吗？

完全可以。无脸号创作者最担心被平台判定为“搬运重复内容（Reused Content）”或“低质 AI 垃圾”导致无法获利。由于本项目生成的是具有高度原创叙事节奏、独特视觉分镜和有针对性撰写的故事脚本，成片完全属于高价值原创内容，符合 YouTube 创作者收益计划（YPP）与 TikTok 创作者基金的变现标准。

### Q3. 我需要懂编程或者拥有昂贵的高性能显卡吗？

完全不需要。你不需要购买几万块的专业独立显卡，也不需要懂写代码。

- **分镜导演模式（Director Mode）**：直接在任意支持 Skill 的 AI 助手对话框里用普通中文/英文交流即可使用；
- **全自动模式（Autopilot Mode）**：运行在 Claude Code、Codex 或 Cursor 等现代智能体环境中，所有繁重的生成均交由云端 API 或轻量级渲染完成，不消耗本地硬件配置。

### Q4. 如果我手里没有写好的现成剧本，能直接做视频吗？

可以。你可以直接扔给 AI 导演一段粗糙的想法、一个新闻链接、甚至一整篇公众号长文。AI 导演会自动提炼核心戏剧冲突，写出前 3 秒爆款黄金钩子，并将你的主题拆解为带有幽默节奏与台词断句的 6 幕式标准分镜。

<!-- readme:platforms -->

### Q5. 我应该如何选择“分镜导演模式”与“全自动模式”？

- **选择分镜导演模式（Director Mode）**：当你希望严格把控每一个镜头构图、运镜轨迹和视觉隐喻时使用。它是你的“零成本安全网”，在生成任何真实视频之前，你可以完全免费地反复微调剧本和分镜；
- **选择全自动模式（Autopilot Mode）**：当你追求极致出片效率、想当甩手掌柜时使用。一键自动编排剧本、对齐配音、生成字幕并合成完整成片。

### Q6. 它是如何确保视频具有高完播率、有梗且不枯燥的？

普通 AI 工具只会机械地把文字直译成画面，导致视频像催眠 PPT。Stickman Video Director 植入了专业的**视觉叙事心理学**：

- **黄金 3 秒钩子**：将开篇第一句话重构为视觉反差或悬念冲突，瞬间抓住注意力防止观众划走；
- **爆款视觉隐喻**：把枯燥抽象的概念转化为具象的搞笑视觉梗（例如把“精神内耗”具象化为一个疯狂自转的仓鼠轮，把“被掏空”具象化为头顶仅剩 1% 的低电量进度条）；
- **卡点与节奏留白**：内置情绪铺垫、反转神表情与音效提示点（SFX），完美还原 Casually Explained 等顶流创作者的幽默节奏。

### Q7. 支持哪些 AI 助手和剪辑软件？

- **支持环境**：无缝兼容 Claude Code、OpenAI Codex、Cursor、Antigravity 等任意具备终端或文件读写能力的智能体环境；
- **视频模型**：生成的提示词深度适配 Google Flow、Runway (Gen-3)、Luma、Kling（可灵）、Pika 等主流工具；
- **剪辑软件**：导出的音画素材可直接一键拖入 CapCut（剪映海外版）、Premiere Pro、DaVinci Resolve 进行微调。

### Q8. 如果成片里某个单独镜头我不满意，必须全片推倒重做吗？

绝对不需要！这是我们 6 幕式模块化架构的最大优势。如果你对第 3 个镜头不满意，你只需单独重新生成第 3 个镜头，第 1、2、4、5、6 镜头的音频和素材完全保留，为你节省 80% 的返工剪辑时间，杜绝浪费 API 额度。

<!-- readme:contribute -->

<a id="road-to-10000-stars--creator-ecosystem"></a>

## ⭐ 迈向 10,000 Stars 与创作者生态

**每一颗 Star，都为下一次更新添一把火！** 我们正在一起打造一个 100% 免费、开源的工作室，帮助独立创作者运营不露脸频道，无需每月支付 50 美元的 SaaS 订阅费。

- [x] **1,000 Stars**：已推出导演模式 + 5 种核心画风
- [x] **3,000 Stars**：已推出全自动模式，一键生成视频
- [ ] **🔥 5,000 Stars**：
  - 上线 5–10 种新画风
  - 推出适用于 YouTube Shorts 与 TikTok 的一键批量编辑器
- [ ] **7,500 Stars**：
  - 提供 1,000+ 条爆款 YouTube 脚本提示词库
  - 提供 200+ 款免版税、可安全通过 Content ID 的音效与转场
- [ ] **10,000 Stars**：推出官方一体化 Web Studio

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="kaomei/stickman-video-director 的 GitHub Star 增长曲线" width="800">
  </picture>
</a>
</div>

<a id="whats-next"></a>

## 🔮 计划中的画风

我们正在为最受欢迎的不露脸 YouTube 内容领域训练新的专用引擎：

- **OverSimplified 式历史与传说** — 迷你历史人物、征服箭头与讽刺战役地图
- **火柴人格斗与速度线** — Alan Becker 式动态打斗、武术与冲击帧
- **暗黑心理学与斯多葛黑色风格** — 氛围剪影、发光双眼与《权力的 48 条法则》式叙事
- **华尔街与硅谷讽刺** — 西装领带火柴人、暴跌图表与职场吐槽
- **双麦播客与单口喜剧** — 节奏明快的对话喜剧、访谈再创作与角色斗嘴
- **互联网谜团与都市传说** — 诡异铅笔素描、模拟信号故障与 Reddit 悬疑故事

## 💬 社区与投稿

想推荐画风，或让你的频道获得展示？欢迎通过 Telegram 联系 **[@CrazyKaomei](https://telegram.me/CrazyKaomei)**：

- **推荐画风**：发送视觉参考链接 + 你想做的内容领域。
- **作品展示**：用这个工具制作了视频？发送作品链接，就有机会在本 README 和官方 YouTube 频道中展示！

🔔 *在 X 上关注 **[@CrazyKaomei](https://x.com/CrazyKaomei)**，获取每日视频制作流程、自动化工具与频道增长 SOP。*

## 📄 许可证

本项目采用 [MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) 开源，允许免费使用、修改、商用和分发。分发本项目或其重要部分时，请保留原有版权和许可声明。

项目按“现状”提供，不作任何担保；完整条款见 [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)。
