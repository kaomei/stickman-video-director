<div align="center">

[🇺🇸 EN](README.en.md) · [**🇨🇳 简中**](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**将任何脚本变成适合不露脸 YouTube 频道的多画风爆款火柴人动画视频。完全开源。**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

给一个话题、一篇文章或链接，自动制作画面、旁白、字幕、音效与微动画，交付完整火柴人视频。**不出镜，也能做出有辨识度的 YouTube 频道。**

汇总全网热门的火柴人画风，持续更新与开源——适用于 **知识科普、心理励志、教育宣传、情感治愈、流行故事等多赛道。**

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
</table>

<div align="center">

**6 大画风 · 8 种视觉方案 · 实测样片 · 免费开源**

⭐ **本系列持续更新，欢迎点个 Star，更多热门画风陆续上线。**

[开始使用](#quick-start) · [A 画风](#a-styles) · [B 画风](#b-styles) · [常见问题](#faq)

</div>

<a id="creation-modes"></a>

## 两种视频制作模式

**想精细控制镜头，选 A · 导演模式；想做长片、不想逐段拼装，选 B · 全自动模式。** 同一个项目，两种制作方式。

|  | <div align="center">A · 导演模式</div> | <div align="center">B · 全自动模式</div> |
|:---:|:---|:---|
| **特点** | **你来掌镜，AI 做导演**：生成分镜与提示词，由你控制片段生成和剪辑。 | **给出话题或需求，直接拿成片**：自动完成插画、配音、字幕、微动画与视频合成。 |
| **时长** | **短片优先**，如 30 秒–3 分钟；也可逐段制作更长内容。 | **长片优先**，尤其适合 **10 分钟及以上**的旁白视频，也能做短片和连续故事短剧。 |
| **工具** | 用支持 Skill 的 AI 助手做提案，再到 **Google Flow** 等平台生成片段，用**剪映**等工具剪辑。 | 在 **Codex、Claude Code** 等能读写文件、调用工具和执行命令的 AI 编程代理中运行，串起素材生成与本地合成。 |
| **画面** | **逐段生成动画**：侧重角色动作、镜头调度与人物互动。 | **插画分镜＋微动画**：用切镜、推拉和平移配合旁白讲故事，不必逐段生成完整动作视频。 |
| **产出** | 导演提案、分镜、逐段视频提示词与声音设计。 | **带配音、字幕与微动画的完整视频文件**。 |
| **开始** | <div align="center"><a href="#director-start">使用导演模式</a></div> | <div align="center"><a href="#autopilot-start">使用全自动模式</a></div> |

两种方式都可从**话题、文案或完整脚本**开始。**A、B 画风独立编号、分别展示，不共用画面；新画风与样片在各自系列下更新。** 画幅、旁白语言和音色按需选择。上面的时长是选型建议，不是硬性限制。

全自动模式需要可用的图像、配音等生成服务与本地视频合成环境；普通聊天窗口不能直接替代这套运行环境。Skill 免费开源，所接服务可能另行收费。

<a id="quick-start"></a>

## 开始使用

把下面这段发给支持 Skill 的 AI 助手。安装成功后，AI 助手会介绍**两种模式能做什么、如何开始**，并给出可以直接照着说的示例。

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

第一次做，可以跟着[完整制作教程](https://x.com/CrazyKaomei/status/2102311241046008268)跑一遍。

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

<a id="style-gallery"></a>

<a id="a-styles"></a>

## A · 导演模式画风一览

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

<a id="b-styles"></a>

## B · 全自动模式画风一览

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

画风介绍、独立样片与使用示例将在这里更新。

<!-- readme:reliability -->

<a id="faq"></a>

## 常见问题

### Q1. 没有脚本，也能做视频吗？

可以。给一个话题、一篇文章、一个链接或具体需求，AI 助手会先整理成视频脚本；已有脚本也可以直接使用。最好一起说明目标观众、发布平台和期望时长。

### Q2. 导演模式的画风可以做成全自动吗？为什么要有导演模式？

目前 A 系列画风的制作流程相对独立，但你可以让 AI 助手采用喜欢的 A 系列画风，结合 B 系列的制作流程，自行 DIY。

保留导演模式，主要是为了控制视频生成和试错成本——制作十几分钟的长视频，一轮完整生成的费用可能达到 **几十美元左右**，反复重做还会增加开销。因此，导演模式保留逐段生成、检查和手动剪辑，既让你掌控每个镜头，也能先确认效果，再决定是否继续。

### Q3. 导演模式生成的人物不一致怎么办？

可以先告诉 AI 助手：“先帮我设计符合所选画风的火柴人，确认三视图（正面、侧面、背面），再给分镜提示词。”想做专属形象的视频，也可以这样开始。已有确认的角色参考图可直接复用，不需要定制时也可跳过这一步。

在支持参考图的视频工具中，生成**每段视频时都附上已确认的角色图**。参考图是额外辅助，不替代原有分镜提示词，也不改变所选画风的规则；最终仍需检查各段人物是否一致。

### Q4. 一定要用 Codex 吗？

不一定。导演模式可以在支持安装和使用 Skill 的 AI 助手中使用。

全自动模式需要 Codex、Claude Code 等能够读写文件、执行命令的环境，并配置相应的生图、配音服务和本地依赖。

<!-- readme:platforms -->

### Q5. 怎么把文章或参考内容，变成更有吸引力的视频？

告诉 AI 助手你想吸引谁、重点讲什么，以及希望观众看完后做什么。AI 助手会据此提炼选题角度，设计开场钩子、叙事推进和结尾引导，再整理成分镜。

有喜欢的视频，也可以提供参考，说明你喜欢它的节奏、表达方式或故事结构。借鉴方法，保留自己的观点与表达；涉及历史、商业和科学的事实，发布前仍需核查。

### Q6. 使用需要付费吗？

Skill 免费开源。生图、配音和视频生成等服务，按你选择的平台及账号方案计费；订阅某个平台的会员，不一定包含它的 API 调用额度。

### Q7. 画面或配音不满意，需要全部重做吗？

不需要。建议先确认脚本和制作方案，再做短样片，检查画风、人物、声音、字幕与节奏，满意后再制作整片。

如果只有某一段不合适，可以优先调整对应片段，复用已经确认的配音和素材，减少返工与重复消耗。

### Q8. 做出来的视频可以发 YouTube、用于商业项目吗？

项目采用 MIT 许可，允许商用。视频使用的第三方图片、音乐、音效及配音服务仍需遵守各自的授权条款；能否开通 YouTube 收益，则以平台审核为准。

<!-- readme:contribute -->

## 更多画风，更多创作可能

⭐ **想做不露脸的 YouTube 频道，探索内容变现？** Star 这个项目，持续获取火柴人画风、视频提示词和自动化制作流程，让你的频道不再卡在“视频怎么做”这一步。

🔔 **关注 [@CrazyKaomei](https://x.com/CrazyKaomei)**：获取不出镜 YouTube 视频的自动化工作流与实用工具，串联脚本、配音、生图和剪辑，减少重复操作，让一个人也能持续产出。更多选题、频道增长与内容变现思路，持续分享。

<a id="whats-next"></a>

🎨 **更多画风（计划中）**：手绘绘本、涂鸦打斗、双人情景喜剧、卡牌闯关，以及虚实融合和讲台解说。

💬 **建议与投稿**：想看新画风、分享作品或反馈问题，欢迎通过 Telegram 联系 [@CrazyKaomei](https://t.me/CrazyKaomei)。画风建议请附参考和想做的主题；投稿请附作品、所用风格与作者链接，方便展示和署名。

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="kaomei/stickman-video-director 的 GitHub Star 增长曲线" width="800">
  </picture>
</a>
</div>

## 许可证

本项目采用 [MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) 开源，允许免费使用、修改、商用和分发。分发本项目或其重要部分时，请保留原有版权和许可声明。

项目按“现状”提供，不作任何担保；完整条款见 [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)。
