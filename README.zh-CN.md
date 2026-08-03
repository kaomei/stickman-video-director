<!-- readme:hero -->

<div align="center">

[English](README.md) · [**简体中文**](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português do Brasil](README.pt-BR.md)

# Stickman Video Director

### 把任何想法，变成一支真正“动起来”的一分钟火柴人视频。

一个 Codex Skill，就能把你的文案变成经过确认的英文旁白、以画面为先的导演提案，以及六条可直接生产的 Gemini Omni Flash 提示词。

![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)
![Gemini Omni Flash](https://img.shields.io/badge/Gemini-Omni%20Flash-6d28d9?style=flat-square)
![一分钟视频](https://img.shields.io/badge/Video-≈60%20seconds-0066ff?style=flat-square)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

适合制作发布在 **YouTube Shorts、TikTok、Instagram Reels 和 YouTube** 上的知识解释、励志故事、教育短片与快节奏视觉内容。

</div>

<!-- readme:demos -->

## 两种高对比风格，一套统一的视觉语言

| 白底黑火柴人 | 黑底白火柴人 |
|:---:|:---:|
| <!-- demo:light:start --><img src="assets/readme/light-theme-preview-placeholder.svg" alt="白底黑火柴人和高饱和强调色的浅色主题预览" width="600"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="assets/readme/dark-theme-preview-placeholder.svg" alt="黑底白火柴人和高饱和强调色的深色主题预览" width="600"><!-- demo:dark:end --> |
| 白色画布 · 黑色人物 | 黑色画布 · 白色人物 |

> 两种主题的真实效果片段即将补上。如果你想关注后续更新，也愿意让更多创作者发现它，欢迎给仓库点一个 Star。

## 有文案，不等于已经有了视频

一个好想法仍然可能生成一段平淡的动画：一个人物、一个背景，十秒钟里几乎没有新的视觉变化。真正导演完整的一分钟，需要设计开场钩子、控制解释节奏、创造贴合内容的视觉隐喻、推动镜头、连接场景，并在多次独立生成之间锁住一致性。

**Stickman Video Director 会在你消耗生成额度之前，先完成这些制作层面的思考。**

<!-- readme:advantages -->

## 为什么短视频创作者会需要这个 Skill

| 优势 | 你会得到什么 |
|---|---|
| **更强的故事结构** | 在保留核心含义的前提下，把原始材料重组成强开场、递进解释和结尾回扣。 |
| **真正的确认节点** | 先展示清晰可读的六幕导演提案，再生成最终模型提示词；在修改成本最低的时候调整故事。 |
| **丰富且相关的动态画面** | 每段规划三个时间节拍，并加入视觉隐喻、环境变化、镜头运动、文字节点、人物互动、转场、BGM 与音效。 |
| **完整的生产锁定** | 在每条独立提示词中重复人物、线条粗细、配色、声音、台词、音频、转场和负面约束。 |
| **真正适配画幅的导演方式** | 针对 `9:16`、`16:9` 或 `1:1` 重新设计构图、镜头路径和文字位置，而不是只替换一个比例标签。 |
| **可控的视觉反差** | 支持白底黑人、黑底白人，以及最多三种高饱和强调色。 |
| **忠于原始材料** | 不随意编造缺乏依据的事实、数据、引语或产品卖点。 |

无需 API，也不依赖 MCP。安装 Skill、调用它，然后在对话中完成整个制作流程即可。

<!-- readme:platforms -->

## 同一个想法，为不同屏幕重新构图

| 比例 | 适合场景 | 导演重点 |
|---|---|---|
| `9:16` | YouTube Shorts、TikTok、Instagram Reels | 纵向纵深、醒目的中央轮廓、层叠式揭示、适合手机阅读的文字 |
| `16:9` | YouTube 知识视频、教育内容、视觉随笔 | 横向调度、侧向镜头运动、分屏对比、充足的负空间 |
| `1:1` | 社交平台信息流、紧凑的产品故事 | 强中心构图、放射式运动、清晰的边缘留白 |

<!-- readme:workflow -->

## 粘贴 → 选择 → 确认 → 生成 → 拼接

1. **粘贴**文案、笔记、文章，或者只给出一个主题。
2. **选择** `16:9`、`9:16` 或 `1:1`，再选择浅色或深色主题。
3. **确认**包含英文 VO、参考翻译、画面、镜头、转场、BGM 和音效的详细导演提案。
4. **生成**当前提案获批后的六条独立 Gemini Omni Flash 提示词。
5. **拼接**六段约十秒的视频，组成一支连贯的一分钟成片。

画幅、主题、旁白、场景结构、配色、声音或基调都可以修改。发生全局变化时，Skill 会回到提案阶段并重新请求确认。

<!-- readme:output -->

## 最终会得到什么

- 面向创作者的英文标题、核心观点、开场钩子、基调、配色、声音与音乐方向
- 约 **130–150 个英文单词**的一分钟旁白
- 六个彼此不同的画面场景，每两到三秒出现一次明显变化
- 精确英文台词与参考翻译
- 六条带时间节拍和负面约束的独立 Gemini Omni Flash 提示词
- 前后匹配的结尾与开场，让片段之间更容易衔接
- BGM、音效、一致性和最终拼接建议

<details>
<summary><strong>示例请求</strong></summary>

```text
Use $directing-stickman-videos to turn this copy into a one-minute English stickman video:

Gravity bends space and time so strongly around a black hole that even light cannot escape.
```

Skill 会先询问缺失的画幅和主题，然后展示六幕导演提案供你确认，确认前不会生成最终模型提示词。

</details>

<!-- readme:install -->

## 安装

克隆仓库：

```bash
git clone https://github.com/kaomei/stickman-video-director.git
cd stickman-video-director
```

把可安装的 Skill 文件夹复制到 Codex skills 目录：

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

重启 Codex，让 Skill 出现在可用列表中。然后调用它并粘贴你的素材：

```text
$directing-stickman-videos
```

<!-- readme:reliability -->

## 为反复修改而设计，也诚实面对生成差异

- **确认必须明确。** 当前提案没有得到批准前，不会进入 Phase B。
- **全局变化会触发重新构图。** 新画幅或新主题会重新设计导演提案，而不是机械替换文字。
- **提示词可以独立使用。** 每条都会重复独立生成所需的关键锁定条件。
- **内容始终有依据。** Skill 可以强化结构与表达，但不会添加没有来源的主张。
- **音频仍可能存在差异。** 独立生成的视频可能出现轻微的声音或音乐差别。追求最高一致性时，可以保留每段同步音效，并在拼接时使用一条连续的外部旁白和 BGM。

## 仓库结构

```text
skills/directing-stickman-videos/  可安装的 Skill
assets/readme/                     README 演示素材
tests/                             行为场景与验证脚本
docs/superpowers/specs/            已确认的产品设计
docs/superpowers/plans/            实施计划
```

<!-- readme:contribute -->

## 一起把它做得更好

欢迎提交使用案例、提示词改进、真实生成记录与具体建议。你可以创建 issue，或者通过 pull request 提交一个范围明确、能够复现的改动。

如果这个 Skill 帮你把一个迟迟没有完成的想法，变成了一支真正可以发布的视频，**请给仓库点一个 Star**。它会帮助下一个正在寻找同样工作流的创作者发现这个项目。

## 许可证

MIT
