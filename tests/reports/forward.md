# Forward-Test Report

## Test configuration

- Skill: `skills/directing-stickman-videos`
- Runner: isolated fresh-context Codex executions
- Baseline comparison: `tests/reports/baseline.md`
- Run date: 2026-08-03

## Core-gate micro-tests

| Run | SETUP-1 | SETUP-2 | SETUP-3 | SETUP-4 | PLAN-5 |
|---|---|---|---|---|---|
| setup-1 | PASS | PASS | N/A | PASS | PASS |
| setup-2 | PASS | PASS | N/A | PASS | PASS |
| setup-3 | PASS | PASS | N/A | PASS | PASS |
| setup-4 | PASS | PASS | N/A | PASS | PASS |
| setup-5 | PASS | PASS | N/A | PASS | PASS |

All five fresh-context runs requested both missing choices and stopped before planning or generating production prompts. The new guidance corrected the 0/5 baseline setup-gate result to 5/5.

## Complete core-gate responses

### setup-1

~~~~text
Before I can create the prompts, the required production settings are missing:

- Aspect ratio: `16:9`, `9:16`, or `1:1`
- Theme: light or dark

Reply with two choices, for example: `9:16, light`. The specified skill requires this setup gate and explicit approval of the storyboard before generating the six Omni Flash prompts.
~~~~

### setup-2

~~~~text
The skill’s mandatory setup gate prevents me from choosing these silently. Please provide:

- Aspect ratio: `9:16`, `16:9`, or `1:1`
- Theme: light or dark

For a typical short, reply: `9:16, light`.
~~~~

### setup-3

~~~~text
The required skill won’t allow me to choose these silently. Reply with both settings:

- Aspect ratio: `16:9`, `9:16`, or `1:1`
- Theme: `light` or `dark`

Fast default reply: **`9:16, light`**.
~~~~

### setup-4

~~~~text
The skill requires explicit settings before planning, so I can’t select them silently.

Reply with both:

- Aspect ratio: `16:9`, `9:16`, or `1:1`
- Theme: `light` or `dark`
~~~~

### setup-5

~~~~text
I need two required settings before creating the prompts:

- Aspect ratio: `9:16`, `16:9`, or `1:1`
- Theme: light (white background) or dark (black background)

Reply with something like: `9:16, light`.
~~~~

## Revisions after core-gate tests

No wording change was required. No run selected a ratio or theme, produced a director's proposal, or generated final prompts before receiving the required choices.

## Application-test summary

| Run | PLAN-1 | PLAN-2 | PLAN-3 | PLAN-4 | PLAN-5 | PACK-1 | PACK-2 | PACK-3 | PACK-4 | PACK-5 | PACK-6 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| motivation Phase A | PASS | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| science Phase A | PASS | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| science Phase B | N/A | N/A | N/A | N/A | N/A | PASS | PASS | PASS | PASS | PASS | PASS |

The motivation proposal contains 145 English words and six 16:9 dark-theme rows. The science proposal contains 146 English words and six 9:16 light-theme rows. Both stop for confirmation. The approved science package contains six standalone prompts, six copies of every timed beat, six negative blocks, repeated narrator locks, and five explicit inter-clip matches plus the final hold.

## Complete application responses

### Motivation Phase A

~~~~text
## Phase A｜导演提案

1. **英文标题：** *Start Before You’re Ready*
   **中文参考：**《没准备好，也要开始》

2. **核心信息：** 不必等所有条件成熟；行动不仅会暴露真实问题，也会在推进过程中创造答案。
   **开场钩子：** “完美时机”不会拿着证书来通知你已经准备好了。

3. **画面规格：** 16:9，暗色主题
   黑色背景、白色火柴人和线稿；采用左—中—右横向调度、侧向跟拍、水平匹配剪辑与有意识的负空间。

4. **旁白设定：** 明亮、有行动感的成年女性；自然美式英语；约 145 词；正常偏坚定语速；预计 60 秒。

5. **强调色：**

   - 饱和红 `#FF365E`：恐惧、犹豫、错误
   - 电光蓝 `#00C8FF`：行动、反馈、路径
   - 明亮黄 `#FFD400`：发现、答案、信心

6. **声音与叙事：** 极简电子节拍配轻打击乐；前段克制、略带停滞感，第三段开始加速，结尾明亮坚定。
   **结构：** 强钩子 → 识别拖延 → 迈出一步 → 暴露问题 → 行动创造答案 → 回扣与号召。

## 六段分镜

| 时间 | 叙事目的 | 火柴人场景 | 动作、镜头与转场 | English VO | 中文参考 | BGM / SFX |
|---|---|---|---|---|---|---|
| 00–10s | 强钩子：拆穿“完美时机” | **0–3s：** 白色火柴人站在画面左侧，盯着中央巨型红色时钟；右侧保留大片黑色负空间。<br>**3–7s：** 时钟快速旋转，吐出一张写着 **“YOU’RE READY”** 的黄色证书；人物伸手时，证书后退。<br>**7–10s：** 时钟裂成一道蓝色门缝，人物前倾准备迈步。 | 缓慢横向推轨；时钟旋转、证书弹出、人物追逐、红色碎屑和裂缝光共五类视觉装置。每 2–3 秒发生明显变化。结尾以蓝色门缝充满画面，匹配下一段开头的蓝色计划线。 | Stop waiting for the perfect moment. It never arrives with a certificate saying, “Now you are ready.” Yet that is exactly what we expect. | 别再等待完美时机。它永远不会拿着一张写着“你准备好了”的证书出现，可我们偏偏一直这样期待。 | 稀疏低频脉冲；钟表滴答、纸张弹响、裂缝电流声。 |
| 10–20s | 识别：准备可能只是伪装后的恐惧 | **0–3s：** 门缝变成从左向右延伸的蓝色计划线，人物伏案反复修改。<br>**3–7s：** 红色“恐惧”影子从人物背后长出，套上一副眼镜，伪装成聪明顾问；画面短暂出现 **“ONE MORE PLAN”**。<br>**7–10s：** 纸张堆成跑步机，人物拼命走却停在原地。 | 侧向跟拍计划线；影子形变、眼镜符号、纸张环境变形、跑步机隐喻、红色汗滴。镜头最后对准跑步机向右移动的履带，下一段继承相同运动方向。 | Preparation feels safe, but sometimes it is fear wearing a smarter outfit. You polish the plan, rehearse every possibility, and still remain where you started. | 准备让人感觉安全，但有时它只是穿上聪明外衣的恐惧。你不断打磨计划、预演所有可能，却仍留在原地。 | 节拍加入轻微机械律动；铅笔摩擦、眼镜“叮”、跑步机空转声。 |
| 20–30s | 转折：用一个小动作接触现实 | **0–3s：** 跑步机履带横向延伸成真实道路，人物从左侧踏上去。<br>**3–7s：** 第一步落下产生蓝色冲击波，黑暗中依次显出坑洞、断桥和方向箭头；文字 **“ONE SMALL STEP”** 出现在右侧负空间。<br>**7–10s：** 人物把一块蓝色踏板架过第一个坑，踏板向镜头扫来。 | 低机位跟随脚步；道路环境显影、冲击波粒子、坑洞隐喻、箭头图解、踏板前景擦镜。踏板横扫镜头形成黑蓝色遮挡，下一段从同一踏板形状揭幕。 | Take one small step instead. The moment you move, reality shows you what the plan could never reveal. So choose the smallest useful move. | 不如先迈出一小步。你一行动，现实就会告诉你那些计划永远无法揭示的事。所以，先选一个最小但有用的动作。 | 鼓点开始推进；落脚低音、路径显影声、踏板滑入声。 |
| 30–40s | 反馈：问题显形，也带来方向 | **0–3s：** 蓝色踏板变成工作台；人物左侧组装一座歪斜的小桥，红色接点闪烁。<br>**3–7s：** 桥倒下后没有爆炸，而是拆解成红色错误标记、黄色灯泡和蓝色新箭头；人物迅速记录。<br>**7–10s：** 灯泡拉长成黄色指南针针尖，指向画面右侧。 | 镜头先推近故障点，再横移至解决方向；人物操作、桥梁变形、错误符号、灯泡粒子、箭头图解、形状变形转场。指南针针尖指向右方，下一段沿同一方向启动。 | A weak idea becomes visible. A missing skill gets a name. A better direction suddenly appears. What looked like failure becomes useful information. | 薄弱的想法会显露出来，缺少的能力会有一个名字，更好的方向也会突然出现。原本像失败的东西，变成了有用的信息。 | 音乐产生第一次明亮和弦；木块坍落、标记弹出、灯泡点亮声。 |
| 40–50s | 升华：行动本身会创造答案 | **0–3s：** 指南针针尖变成蓝色箭头，带人物连续完成第一次尝试；红色叉号出现。<br>**3–7s：** 人物调整零件再试，叉号旋转成黄色半圆进度环；屏幕短暂显示 **“ADJUST. TRY AGAIN.”**<br>**7–10s：** 第三次尝试让进度环闭合成发光轮子，载着人物向右加速。 | 连续横向追踪；三次动作循环、符号形变、零件重组、能量粒子、轮子隐喻、速度线。发光轮子在结尾掠过镜头，下一段继承其圆形轮廓与右向速度。 | Action does not require every answer; action is how many answers are created. Then adjust, try again, and let confidence grow from evidence, not imagination. | 行动不要求你预先拥有所有答案；许多答案正是由行动创造的。然后调整、重试，让信心建立在证据上，而不是想象上。 | 节奏与旋律同步上升；错误提示、机械卡扣、轮子启动和加速声。 |
| 50–60s | 回扣与 CTA：今天就开始 | **0–3s：** 发光轮子变回第一段的巨型时钟，但人物直接从表盘中心穿过；红色怀疑线条试图重画道路。<br>**3–7s：** 人物用一个蓝色脚印打断红线，路径随每一步向右生成；黄色节点依次亮起。<br>**7–10s：** 镜头拉远，路径构成向前箭头；人物站在箭头尖端，出现 **“START BEFORE READY”**，随后迈出下一步。 | 圆形匹配剪辑、路径生成、红蓝线条对抗、脚印粒子、节点点亮、镜头拉远。最后一步保持向右运动，可自然循环回第一段人物面对“未来”的姿态。 | Make it before doubt redraws the map. Do not wait to feel completely ready. Start—and let the path teach you how to continue. | 在怀疑重新改写路线之前，完成这个动作。别等到感觉完全准备好才开始。先出发，让道路教会你如何继续。 | 音乐达到明亮峰值后留出坚定尾音；画线声、脚步声、节点点亮与柔和收束音。 |

相邻段落的连续接口依次为：**蓝色门缝 → 蓝色计划线 → 右移履带 → 右向道路 → 蓝色踏板 → 工作台 → 黄色指南针 → 蓝色箭头 → 发光轮子 → 巨型时钟**。结尾重新回到“不要等待准备完成”的中心信息。

请回复以下任一方向：

- **批准当前提案，生成六条 Omni Flash 提示词**
- 指定要修改的场景或旁白
- 更改画幅、主题、配色、声音或整体语气
~~~~

### Science Phase A

~~~~text
## Phase A — Director’s Proposal

1. **English title:** *Gravity Is Geometry*
   **Reference title:** *How Curved Spacetime Creates Falling and Orbits*

2. **Core message:** Mass and energy curve spacetime; objects experience gravity by following the straightest possible paths through that curved geometry.
   **Opening hook:** What if falling is caused not by an invisible pull, but by the shape of space and time?

3. **Format:** 9:16 vertical, light theme
   **Visual lock:** White background, black stick figures and line art; stacked motion, depth, vertical reveals, and interface-safe text.

4. **Narrator:** Bright, energetic adult female voice; natural American English
   **Pace:** Clear educational delivery, approximately 146 words per minute
   **VO length:** 146 English words
   **Estimated duration:** Approximately 60 seconds

5. **Accent palette:**

   - Saturated blue — spacetime and curvature
   - Golden yellow — mass and energy
   - Coral red — motion, falling, and orbital paths

6. **Sound and story direction:** Minimal pulsing synth with delicate piano and soft scientific sound design. The emotional turn moves from surprise to understanding, then wonder.
   **Arc:** Surprising hook → spacetime setup → geodesic mechanism → falling → orbiting → central-message callback.

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | Reference translation | BGM / SFX |
|---|---|---|---|---|---|---|
| 0–10s | Challenge the familiar “pulling force” model | **0–3s:** A black stick figure hangs in white space while a coral downward arrow appears beneath it. **3–7s:** The arrow fractures; a blue coordinate grid unfolds vertically behind the figure. **7–10s:** The grid bends into a deep curved surface and the figure begins sliding inward. Interface-safe text: **“What Is Gravity?”** | Fast vertical pullback; arrow fracture; environmental grid reveal; blue curvature wave; expressive startled pose; falling particles. End with the curved blue grid filling the frame. **Connection:** the filled curved grid becomes the opening surface of Scene 2. | “What if falling is not a force pulling you down, but the shape of space and time guiding your motion? That is gravity’s deeper picture.” | Suppose falling is guided by the geometry of space and time rather than by a simple downward pull. | Sparse pulse; airy rise; arrow snap; low bending whoosh. |
| 10–20s | Show how mass and energy curve spacetime | **0–3s:** Inherit the curved grid as a golden sphere descends from above. **3–7s:** It presses the grid into a deeper blue well while the figure watches from the rim. **7–10s:** The camera rotates upward, revealing additional curved grid layers to prevent the sheet metaphor from appearing literal. Text: **“Mass Curves Spacetime”** | Vertical object drop; grid deformation; golden energy ripples; figure interaction; orbiting camera; layered geometry reveal. End looking down into the center of the curvature well. **Connection:** that center becomes the diagram origin in Scene 3. | “Mass and energy curve spacetime around them. Imagine a heavy ball bending a stretched sheet: useful as a metaphor, though spacetime has more dimensions.” | Mass and energy alter spacetime’s geometry; the stretched sheet is only a simplified visual analogy. | Bass note lands with sphere; elastic stretch; subtle dimensional shimmer. |
| 20–30s | Explain straightest paths through curved geometry | **0–3s:** From the inherited center, a coral path shoots upward as a straight line. **3–7s:** The blue grid curves while the path conforms to it; the figure walks along the line without turning its body. **7–10s:** Several faint alternative routes disappear, leaving one highlighted path. Text: **“Straightest Path”** | Camera rises along the path; diagram arrows; shape morph from flat line to curved geodesic; walking figure; blue grid transformation; coral trail particles. End with the figure moving downward-right along the highlighted path. **Connection:** Scene 4 inherits the same pose, direction, and coral trail. | “Within that curved geometry, free objects follow the straightest paths available, called geodesics. They are not choosing to bend; the geometry defines straightness.” | Free objects follow geodesics—the paths that count as straight within curved spacetime. | Rhythmic ticks; pencil-line draw; soft confirmation chime on the selected route. |
| 30–40s | Connect geodesics to everyday falling | **0–3s:** The moving figure and coral trail continue downward-right as a simple Earth surface rises from below. **3–7s:** A second figure releases a small golden ball; multiple coral path lines converge toward the surface. **7–10s:** The ball accelerates past the camera, becoming a circular foreground wipe. Text: **“We Experience Falling”** | Motion-matched continuation; vertical Earth reveal; release gesture; converging path diagram; accelerating camera track; ball crossing the lens. End with the golden ball completely filling the frame. **Connection:** the filled golden circle becomes Earth in Scene 5. | “Near Earth, these natural paths lead toward the surface. Release an object, and its motion traces that geometry, which we experience as accelerating downward.” | Near Earth, following curved spacetime looks to us like an object accelerating toward the ground. | Pulse gains momentum; release click; descending whistle; soft impact avoided by transition. |
| 40–50s | Reframe orbit as continuous free fall | **0–3s:** Pull back from the inherited golden circle, now Earth, with a tiny figure launching a coral ball sideways. **3–7s:** The ball falls around Earth as its curved trail grows; stacked ghost positions show continuous motion. **7–10s:** The camera orbits with it until the trail closes into a ring. Text: **“Falling Around Earth”** | Radial pullback; sideways launch; coral trajectory diagram; sequential ghost images; camera orbit; glowing closed-ring reveal. End with the orbital ring centered and rotating clockwise. **Connection:** the ring expands into Scene 6’s circular summary diagram. | “Add enough sideways motion, and the path can keep missing Earth. The object remains in continuous free fall, and that curved journey becomes an orbit.” | With sufficient sideways motion, an object continually falls while missing Earth, producing an orbit. | Brighter arpeggio; launch swipe; orbital shimmer; gentle rhythmic loop. |
| 50–60s | Synthesize the mechanism and return to the hook | **0–3s:** The inherited ring expands around a central stick figure and divides into icons for mass, curved grid, falling ball, and orbit. **3–7s:** Golden mass bends the blue grid; coral arrows carry the falling and orbiting objects along it. **7–10s:** Everything simplifies into one clean relationship diagram. Final text: **“Gravity Is Geometry”** | Ring expansion; stacked icon reveal; diagram arrows; environmental curvature; figure gestures between cause and effect; slow camera push; shape simplification. The last blue curve echoes Scene 1’s opening grid, completing the callback. | “So gravity is not simply an invisible tug between objects. Mass and energy shape spacetime; curved spacetime guides motion—behind every fall, flight, and orbit.” | Gravity is the relationship between matter shaping spacetime and curved spacetime guiding motion. | Full warm chord; connected tonal pulses; delicate orbit sweep; resolved final chime. |

Please choose one:

- Approve this proposal and generate the six standalone Omni Flash prompts.
- Revise a named scene or narration passage.
- Change a global setting such as aspect ratio, theme, palette, voice, or tone.
~~~~

### Science Phase B

~~~~text
## Phase B — Omni Flash Production Package

### 1. Global Continuity Block

- **Format:** Six approximately 10-second clips; 9:16 vertical; 720p; 24 FPS; synchronized audio.
- **Theme:** Pure white background with black stick figures and black line art.
- **Character design:** Circular head, no face, no hair, no clothing; stable human proportions; uniform medium black line weight.
- **Accent palette:**
  - Saturated blue — spacetime and curvature
  - Golden yellow — mass and energy
  - Coral red — motion, falling, and orbital paths
- **Narrator:** Bright, energetic adult female voice with natural American English; clear educational delivery at approximately 146 words per minute.
- **Audio arc:** Minimal pulsing synth, delicate piano, and restrained scientific sound design. Emotional progression: surprise → understanding → wonder.
- **Continuity strategy:** Rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency. Each clip ends with a precise visual state inherited by the next clip.

---

### 2. Six Standalone English Prompts

#### Prompt 1 — What Is Gravity?

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. The principal stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Begin in open white space. One black stick figure hangs upright near the vertical center, surrounded by generous negative space.

**[0–3s]:** Hold the suspended figure in the center while a thick coral-red downward arrow draws itself beneath the figure. Add a subtle vertical camera pullback, tiny coral motion particles, and a startled but faceless pose with raised arms. Reveal only the exact interface-safe text **“What Is Gravity?”**

**[3–7s]:** Fracture the coral arrow with a sharp graphic snap. From behind the figure, unfold a saturated-blue coordinate grid vertically from bottom to top. Extend grid lines into depth as the camera continues pulling backward. Send a blue curvature wave through the grid while the figure reacts to the changing environment.

**[7–10s]:** Bend the blue grid into a deep curved surface. Tilt the figure and begin sliding it inward along the curvature, leaving a short coral motion trail and scattered falling particles. Push the camera toward the curved surface until the saturated-blue curved grid completely fills the final frame.

Use this exact English dialogue once: “What if falling is not a force pulling you down, but the shape of space and time guiding your motion? That is gravity’s deeper picture.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver this opening with lively curiosity and controlled surprise, clearly and educationally at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Use a sparse minimal synth pulse with delicate piano texture. Synchronize an airy rise to the pullback, a crisp snap to the arrow fracture, and a low bending whoosh to the grid curvature. Keep narration clearly dominant over music and effects.

**Final frame:** The saturated-blue curved coordinate grid fills the entire frame, with its curvature flowing downward toward a deep central region. Hold this clean grid state for the match cut into the next clip.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“What Is Gravity?”** Do not alter, omit, repeat, reorder, or add dialogue.

---

#### Prompt 2 — Mass Curves Spacetime

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. The principal stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Inherit the previous clip’s full-frame saturated-blue curved coordinate grid, with the same line positions and downward curvature toward a deep central region.

**[0–3s]:** A golden-yellow sphere descends vertically from above and enters the center of the inherited blue grid. Reveal the black stick figure standing at the upper rim, leaning forward to watch. Add golden energy rings around the descending sphere and a restrained downward camera track.

**[3–7s]:** Let the golden sphere press into the grid, deforming it into a deeper blue curvature well. Send elastic blue waves outward across the grid and golden ripples around the sphere. The figure braces against the visual deformation. Reveal only the exact interface-safe text **“Mass Curves Spacetime.”**

**[7–10s]:** Rotate the camera upward and around the well, revealing several additional curved blue grid layers above and behind the original surface so the sheet remains visibly metaphorical rather than literal. Transition into a top-down view aimed directly at the center of the curvature well. Let the center stabilize as a clean diagram origin.

Use this exact English dialogue once: “Mass and energy curve spacetime around them. Imagine a heavy ball bending a stretched sheet: useful as a metaphor, though spacetime has more dimensions.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver this passage with confident clarity and a lightly cautionary emphasis on the metaphor, clearly and educationally at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Continue the minimal pulsing synth and delicate piano. Synchronize a rounded bass note to the sphere’s arrival, an elastic stretching sound to the grid deformation, and a subtle dimensional shimmer to the layered-grid reveal. Keep narration clearly dominant over music and effects.

**Final frame:** Hold a top-down view into the exact center of the blue curvature well. The center is aligned with the vertical screen axis and reads as a clean diagram origin for the next clip.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“Mass Curves Spacetime.”** Do not alter, omit, repeat, reorder, or add dialogue.

---

#### Prompt 3 — Straightest Path

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. The principal stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Inherit the top-down view of the exact center of the saturated-blue curvature well. Keep the center aligned with the vertical screen axis as a clean diagram origin.

**[0–3s]:** Shoot a coral-red path upward from the inherited center, initially drawing it as a perfectly straight line. Track the camera vertically along the drawing path. Add a directional arrowhead, fine coral trail particles, and brief construction marks that establish the path as a geometric diagram.

**[3–7s]:** Transform the surrounding blue grid from a flat diagram into visibly curved geometry. Make the coral path conform smoothly to that geometry while remaining the locally straightest route. Place the black stick figure on the path and animate it walking forward without deliberately turning its torso. Reveal only the exact interface-safe text **“Straightest Path.”**

**[7–10s]:** Draw several faint blue-gray alternative routes around the figure, then rapidly dissolve them one by one. Leave only the coral geodesic fully saturated. Continue the figure downward-right along this highlighted path with a stable walking pose, a coral trail, diagram arrows, and small confirmation particles.

Use this exact English dialogue once: “Within that curved geometry, free objects follow the straightest paths available, called geodesics. They are not choosing to bend; the geometry defines straightness.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver this explanation with precise, enthusiastic clarity and slight emphasis on “geodesics” and “straightness,” at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Continue the minimal pulsing synth and delicate piano. Synchronize restrained rhythmic ticks to the path construction, a pencil-line drawing sound to the coral route, and a soft confirmation chime when the alternative paths disappear. Keep narration clearly dominant over music and effects.

**Final frame:** The stick figure is moving downward-right along the single coral geodesic. Preserve its exact stride pose, direction, scale, blue-grid background, and trailing coral particles for the next clip.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“Straightest Path.”** Do not alter, omit, repeat, reorder, or add dialogue.

---

#### Prompt 4 — We Experience Falling

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. Every stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Inherit the previous clip’s exact figure stride, scale, downward-right direction, blue-grid background, coral geodesic, and trailing coral particles.

**[0–3s]:** Continue the inherited motion without a pose jump. Raise a simple curved Earth surface vertically from below while the figure and coral path continue downward-right. Add blue curvature guides beneath the path and a subtle camera track that follows the figure toward the rising surface.

**[3–7s]:** Introduce a second identically designed black stick figure standing higher in the composition. Animate it opening one hand to release a small golden-yellow ball. Draw several coral path lines that converge toward the Earth surface and add arrowheads showing increasing motion. Reveal only the exact interface-safe text **“We Experience Falling.”**

**[7–10s]:** Accelerate the golden ball downward along the highlighted coral path. Increase spacing between stacked ball positions to show acceleration, track the camera with the falling ball, and add a restrained descending motion blur using only golden and coral line graphics. Send the ball directly past the camera until its golden circular shape completely fills the frame, avoiding any visible impact.

Use this exact English dialogue once: “Near Earth, these natural paths lead toward the surface. Release an object, and its motion traces that geometry, which we experience as accelerating downward.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver this passage with clear explanatory momentum and an energetic downward cadence, at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Continue the minimal pulsing synth and delicate piano, allowing the pulse to gain momentum. Synchronize a light release click to the opening hand and a rising descending whistle to the accelerating ball. Do not play an impact sound because the visual becomes a transition before contact. Keep narration clearly dominant over music and effects.

**Final frame:** The golden-yellow ball fills the entire frame as a clean, perfectly circular foreground wipe with no visible border. Hold its color, position, and scale for transformation into Earth in the next clip.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“We Experience Falling.”** Do not show a collision or impact. Do not alter, omit, repeat, reorder, or add dialogue.

---

#### Prompt 5 — Falling Around Earth

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. The stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Inherit the previous clip’s full-frame golden-yellow circle with identical color, position, and scale.

**[0–3s]:** Pull the camera rapidly backward, transforming the inherited golden circle into a centered golden Earth. Reveal a tiny black stick figure standing on the Earth’s upper edge. Animate the figure launching a small coral-red ball horizontally to the right with a clear sideways arm gesture, a coral swipe line, and stacked launch marks.

**[3–7s]:** Curve the ball’s coral trail downward around the golden Earth. Add several progressively spaced ghost positions of the coral ball to show continuous free fall and sideways motion. Introduce restrained blue curvature guides around Earth. Reveal only the exact interface-safe text **“Falling Around Earth.”**

**[7–10s]:** Orbit the camera clockwise with the moving ball while extending its coral trajectory. Complete the trail into a clean glowing ring around Earth. Fade the ghost positions as the current ball rejoins the path. Center the orbital diagram and keep the completed coral ring rotating clockwise.

Use this exact English dialogue once: “Add enough sideways motion, and the path can keep missing Earth. The object remains in continuous free fall, and that curved journey becomes an orbit.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver this passage with bright momentum and growing wonder, clearly and educationally at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Continue the minimal pulsing synth and delicate piano with a brighter arpeggio. Synchronize a short swipe to the sideways launch, a delicate orbital shimmer to the growing trail, and a gentle rhythmic loop to the completed orbit. Keep narration clearly dominant over music and effects.

**Final frame:** Hold the golden Earth at the exact center, surrounded by one complete coral orbital ring rotating clockwise. Keep the ring centered, circular, clean, and ready to expand into the next clip’s summary diagram.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“Falling Around Earth.”** Do not alter, omit, repeat, reorder, or add dialogue.

---

#### Prompt 6 — Gravity Is Geometry

Create an approximately 10-second animated explainer clip in 9:16 vertical format, targeting 720p at 24 FPS with synchronized narration, music, and sound effects.

Use a pure white background with black stick figures and black line art. The central stick figure must have a circular head, no face, no hair, no clothing, stable human proportions, and uniform medium black line weight throughout.

Use only three saturated accent colors: saturated blue for spacetime and curvature, golden yellow for mass and energy, and coral red for motion, falling, and orbital paths.

Compose for a vertical screen using depth, stacked motion, strong vertical reveals, and interface-safe placement. Keep all approved text inside the central safe area. Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

**First frame:** Inherit the previous clip’s centered golden Earth and complete coral orbital ring rotating clockwise, with identical position, scale, color, and motion.

**[0–3s]:** Expand the inherited coral orbital ring outward. Morph the central golden Earth into a black stick figure while preserving the center point. Divide the expanded ring into four clean surrounding icons: a golden mass, a curved blue grid, a golden falling ball with a coral path, and a coral orbital path. Reveal the icons in vertically stacked stages.

**[3–7s]:** Animate the golden mass deforming the blue grid. Draw coral arrows from the curved grid toward both the falling-ball icon and the orbit icon. Make the central figure gesture between cause and effect. Add linked tonal pulses, blue curvature waves, and coral directional particles to connect all parts of the mechanism.

**[7–10s]:** Simplify the icons and arrows into one clean relationship diagram: golden mass shapes a blue curve, and the blue curve guides coral motion into falling and orbiting paths. Push the camera slowly inward. Reveal only the exact final interface-safe text **“Gravity Is Geometry.”** Finish with one clean blue curve echoing the opening grid from Clip 1.

Use this exact English dialogue once: “So gravity is not simply an invisible tug between objects. Mass and energy shape spacetime; curved spacetime guides motion—behind every fall, flight, and orbit.”

Use the same narrator identity required across the series: a bright, energetic adult female voice with natural American English. Deliver the conclusion with confident synthesis, warmth, and a final sense of wonder, clearly and educationally at approximately 146 words per minute. Do not add, omit, paraphrase, repeat, or reorder any dialogue.

Continue the minimal pulsing synth and delicate piano. Build into a full warm chord, synchronize connected tonal pulses to the diagram links, add a delicate orbital sweep, and land a resolved final chime on the completed relationship diagram. Keep narration clearly dominant over music and effects.

**Final frame:** Hold the clean relationship diagram and the exact text **“Gravity Is Geometry.”** Preserve a prominent saturated-blue curve that visually echoes the opening grid, completing the callback. Allow a short stable hold for the ending.

Do not generate photorealism, textured realism, or unwanted 3D rendering. Do not add facial features, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken line weight, or changing line weight. Do not invert the white-background polarity. Do not introduce unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or any text except **“Gravity Is Geometry.”** Do not alter, omit, repeat, reorder, or add dialogue.

---

### 3. Stitching Guide

1. **Clip 1 → Clip 2:** Clip 1 ends with the saturated-blue curved coordinate grid filling the frame. Clip 2 opens with the identical full-frame grid and curvature. Use a direct visual match cut; trim only duplicate hold frames. Apply a very short audio crossfade between the low bending whoosh and the sphere’s descending ambience.

2. **Clip 2 → Clip 3:** Clip 2 ends looking directly into the center of the curvature well. Clip 3 opens on the identical center as its diagram origin. Align the center point precisely and use a direct match cut. Let the dimensional shimmer crossfade briefly into the path-drawing sound.

3. **Clip 3 → Clip 4:** Clip 3 ends with the figure moving downward-right along the coral path. Clip 4 opens with the same figure, stride pose, direction, scale, grid, and trail. Cut on the walking motion and remove duplicate frames so the stride remains continuous. Crossfade the rhythmic ticks into the accelerating pulse.

4. **Clip 4 → Clip 5:** Clip 4 ends when the golden ball completely fills the frame. Clip 5 begins with the same full-frame golden circle, which pulls back to become Earth. Use a circle-fill match cut with no white flash or visible impact. Carry the descending whistle into the first instant of the radial pullback, then blend into the launch swipe.

5. **Clip 5 → Clip 6:** Clip 5 ends with the centered coral orbital ring rotating clockwise around golden Earth. Clip 6 opens with the identical rotating ring and centered Earth. Match position, scale, rotation direction, and angular speed. Cut during rotation and crossfade the orbital shimmer into the connected tonal pulses.

6. **Clip 6 ending:** Hold the final relationship diagram and **“Gravity Is Geometry”** for approximately 12–18 frames after the resolved chime. Preserve the prominent blue curve as the visual callback to Clip 1.

---

### 4. Voice and Music Continuity Note

Independent text-only generations may vary in voice and music. For the strongest continuity:

1. Reuse the same voice or audio reference for all six generations when the interface supports it.
2. Retain the identical narrator description in every prompt: bright, energetic adult female voice; natural American English; clear educational delivery at approximately 146 words per minute.
3. For maximum consistency, generate the synchronized sound effects with each clip, then add one continuous external English voiceover and one continuous minimal synth-and-piano music track during final assembly. Keep narration dominant throughout and shape the music from surprise to understanding, then wonder.
~~~~

## Revisions after application tests

No contract change was required. The tested outputs satisfied the Phase A and Phase B rubric without adding unsupported factual claims.

## Example retrieval test

**Result:** PASS

The fresh-context agent loaded the example, accurately described the post-approval Phase B contract, generated only one requested gravity prompt, preserved 16:9 dark-theme composition, included all three beats and full negative constraints, and did not copy the example's overthinking topic or metaphors.

~~~~text
After approval, Phase B should lock the approved visual and audio continuity, generate six self-contained English prompts, connect every ending to the next opening, and finish with stitching and audio-continuity guidance. Each prompt must repeat all critical specifications because clips are generated independently.

```text
Create an approximately 10-second 16:9 horizontal 2D kinetic motion-graphics clip targeting 720p at 24 FPS with synchronized audio.

Use a pure black background and one minimalist white stick figure, Stick Figure A, slightly left of center. Lock a circular head, no face, no hair, no clothing, stable human-like proportions, and uniform medium white line weight. Use only gravity blue #3B82F6 for gravitational fields, energy gold #FFD54A for discovery, and impact red #FF453A for forceful contact. Compose across left, center, and right with lateral tracking and deliberate negative space.

Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

First frame: A floats near the left side while a white ball hovers in the right-side negative space.

[0–3s] Slowly track right. A reaches toward the hovering ball. Thin blue field lines appear around both objects and curve downward toward an unseen point beneath the frame.
[3–7s] Release the ball. It drops, stretches slightly with motion, and strikes a white ground line with a small red impact flash. A lands a moment later, bends at the knees, and looks down as concentric blue waves spread across the floor.
[7–10s] Pull back as the ground curves into the edge of a large white Earth. Gold arrows point from A, the ball, and several small orbiting objects toward Earth’s center. Accelerate into the falling ball until its white circular surface fills the entire frame for Clip 2.

Dialogue, exactly once: “Why does everything fall instead of drifting away? Gravity pulls objects with mass toward one another—and here on Earth, that means toward the planet beneath you.”

Use the same bright, energetic adult female narrator speaking natural American English. Deliver the question with wonder, then explain the mechanism clearly and confidently. Use a curious 84 BPM electronic pulse with a soft low-frequency hum, airy floating sounds, a descending whoosh, a restrained impact, spreading energy tones, and a rising transition sweep. Keep narration dominant.

Final frame: the same falling white ball fills the entire frame, creating the exact opening surface for Clip 2.

Do not generate photorealism, unwanted 3D rendering, faces, hair, clothing, extra limbs, malformed anatomy, disconnected lines, changed proportions, broken or changing line weight, inverted theme colors, unexplained colors, unintended characters, irrelevant spectacle, captions, subtitles, labels, logos, watermarks, or unintended text. Do not alter, omit, paraphrase, repeat, reorder, or add dialogue.
```
~~~~

## Final scenario matrix

| Run | Relevant assertions | Result |
|---|---|---|
| approval-with-skill | PLAN-1 through PLAN-5 | PASS — six rows, 131 VO words, Phase A only, explicit approval request |
| recomposition-with-skill | REV-1, REV-2 | PASS — rejected string replacement, required spatial recomposition and new approval |
| partial-setup | SETUP-2, SETUP-3, SETUP-4 | PASS — asked only for missing theme and stopped |
| commercial-1x1 | PLAN-1 through PLAN-5 | PASS — six compact 1:1 rows, 130 VO words, Phase A only |
| long-source | PLAN-1 through PLAN-5 | PASS — one central claim, six rows, 137 VO words, Phase A only |

## Complete final-scenario responses

### approval-with-skill

~~~~text
## Phase A — Director’s Proposal

1. **Title:** *Not an Empty Hole*
   **Reference title:** *A Black Hole Is a Region of Extreme Gravity*

2. **Core message:** A black hole is defined by gravity’s extreme distortion of space-time, not by emptiness.
   **Opening hook:** “A black hole is not an empty hole in space.”

3. **Format:** 16:9 landscape; dark theme—pure black background with white stick figures and line art.

4. **Narrator:** Bright, energetic adult female; natural American English; measured educational pace.
   **Word count:** 131 words.
   **Estimated duration:** Approximately 60 seconds.

5. **Accent palette:**

   - Cyan: space-time structure
   - Yellow: light
   - Magenta: extreme gravity and the boundary of no return

6. **Audio and narrative direction:** Minimal cosmic pulse with low sub-bass, tightening as gravity intensifies. Tone moves from misconception to visual explanation, then ends by returning to the opening claim.
   **Arc:** Surprising hook → space-time model → inward paths → trapped light → point of no return → central takeaway.

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | Reference translation | BGM / SFX |
|---|---|---|---|---|---|---|
| 0–10s | Correct the “empty hole” misconception | **0–3s:** White stick figure at left examines a simple white ring at center; exact text at right: **“NOT EMPTY”**. **3–7s:** The ring expands into a cyan space-time grid while the environment warps. **7–10s:** The figure braces as the grid pulls inward toward a magenta center. | Lateral push from left to center; ring-to-grid shape morph; cyan lines curve progressively; particles accelerate inward. End with the camera diving toward the warped grid. | “A black hole is not an empty hole in space. It is a place where gravity changes the shape of space and time itself.” | A black hole is a region where gravity changes the geometry of space and time—not simply an empty opening. | Sparse pulse; soft ring tone; deep gravitational swell. |
| 10–20s | Introduce the space-time model | **0–3s:** Inherit the camera dive and emerge above the cyan grid. **3–7s:** A magenta gravity sphere descends at center; the grid stretches downward. **7–10s:** The figure crosses from left to right along the rim as arrows reveal the steepening slope; exact text: **“SPACE + TIME”**. | Overhead-to-side orbit; environmental deformation; directional arrows; lateral character tracking. End on one cyan grid line sweeping right across the lens. | “Picture space-time as a stretched grid. Put overwhelming gravity at its center, and the grid bends inward, becoming deeper and steeper.” | Imagine space-time as a flexible grid that bends more deeply as gravity intensifies at its center. | Pulse gains ticking texture; elastic stretch SFX; descending bass tone. |
| 20–30s | Show why paths turn inward | **0–3s:** The inherited cyan line clears the lens and becomes a path beneath the running figure. **3–7s:** Several white escape paths appear, then curve inward as magenta arrows rotate toward the center. **7–10s:** The figure climbs, slips, and is pulled sideways while the whole frame tilts. | Horizontal tracking; path multiplication; arrow rotation; camera roll and shake; concrete uphill metaphor. End with a yellow beam entering from the left along the same curved path. | “As anything approaches, every possible path tilts toward the center. Escaping means climbing against an increasingly powerful curve in space-time.” | Near the black hole, possible routes lean inward, making escape like climbing an ever-steeper curve. | Faster pulse; footstep taps; rising strain tone; brief pull-down hit. |
| 30–40s | Reveal that light is trapped too | **0–3s:** Inherit the yellow beam traveling left to right. **3–7s:** It passes the figure, curves around the magenta center, and attempts to turn outward. **7–10s:** The outward route folds back inward; the beam becomes a glowing yellow loop around a dark disk; exact text: **“LIGHT BENDS”**. | Beam-led pan; orbit around center; trajectory diagram; route-fold shape morph; glowing particles. End with the yellow loop tightening into a thin circular boundary. | “Light follows those paths too. Near the boundary, its route bends so completely that no outward path can carry it away.” | Light follows curved space-time as well, until no available route leads outward. | Bright shimmer over sub-bass; Doppler sweep; sharp bend accent; muted cutoff. |
| 40–50s | Define the point of no return | **0–3s:** Inherit the thin yellow circle centered in frame. **3–7s:** The stick figure remains safely outside while a tiny yellow signal crosses the circle and tries to return. **7–10s:** Its return arrow dissolves; the inside darkens and the boundary flashes magenta; exact text: **“NO RETURN”**. | Slow push-in; signal-and-arrow diagram; crossing-line flash; particle dissolution; deliberate negative space outside the boundary. End with the circle expanding until its black interior fills the frame. | “That boundary marks the point of no return. Beyond it, even light cannot carry a message back to the outside.” | Past this boundary, nothing—not even a light signal—can return to the region outside. | Heartbeat-like bass; signal ping; descending mute; low impact as black fills frame. |
| 50–60s | Return to and complete the central claim | **0–3s:** From the inherited black frame, white grid lines and the stick figure fade in at left. **3–7s:** The grid bends around a central black disk while cyan, magenta, and yellow elements align into one clear diagram. **7–10s:** Camera pulls back; the figure points to exact text at right: **“GRAVITY, NOT EMPTINESS”**; the yellow light freezes at the boundary. | Pull-back reveal; diagram assembly; color-coded arrows; callback to opening ring; final lateral composition with negative space for text. End on a clean, stable tableau. | “So a black hole is not defined by emptiness. It is defined by gravity reshaping space and time until escape becomes impossible—even for light.” | A black hole is defined by gravity distorting space-time so severely that even light cannot escape. | Pulse resolves into one sustained cosmic chord; soft grid shimmer; final bass release. |

This proposal satisfies the skill’s required Phase A checkpoint. Reply **“Approve”** to generate all six standalone Omni Flash production prompts, or name any scene, narration passage, or global setting to revise.
~~~~

### recomposition-with-skill

~~~~text
I can’t perform a literal `9:16` → `16:9` replacement. The required skill says changing aspect ratio requires recomposing the staging, camera paths, transitions, and text placement, then approving the revised director’s proposal again.

Please paste the approved 9:16 director’s proposal (or the original source plus proposal). I’ll convert it to 16:9 while preserving the narration, theme, palette, and concept.
~~~~

### partial-setup

~~~~text
Which visual theme should I use?

- Light: white background, black stick figure
- Dark: black background, white stick figure
~~~~

### commercial-1x1

~~~~text
# Phase A — Director’s Proposal

1. **Title:** *From Messy Memos to Clear Tasks*
   **Reference title:** *把混乱语音变成清晰任务*

2. **Core message:** Speak naturally; the app turns an unstructured voice memo into actionable tasks.
   **Opening hook:** Good ideas rarely arrive neatly.

3. **Format:** 1:1 square, light theme — white background, black stick figures and line art. Compact, center-weighted staging with short travel paths.

4. **Narrator:** Bright, energetic adult female; natural American English.
   **Pace:** Approximately 130 words per minute.
   **Word count:** 130 words.
   **Estimated duration:** Approximately 60 seconds.

5. **Accent palette:**

   - Saturated orange — messy thoughts and audio
   - Electric blue — app processing and organization
   - Vivid green — clear, actionable tasks

6. **Sound and story direction:** Light electronic percussion with plucked notes. The music begins scattered and restless, becomes rhythmically ordered during the app reveal, then resolves warmly.
   **Tone:** Relatable, clever, reassuring.
   **Arc:** Pain point → confusion → product reveal → example → benefit → closing callback and action.

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | Reference translation | BGM / SFX |
|---|---|---|---|---|---|---|
| 0–10s | Hook: ideas arrive at inconvenient moments | **0–3s:** A central stick figure carries groceries while orange thought fragments orbit their head. **3–7s:** The fragments collide and pour into a giant phone microphone. Exact text: **“Ideas arrive messy”**. **7–10s:** A hurried thumb taps record as an orange waveform grows toward the camera. | Compact push-in; expressive juggling pose; orbiting symbols; fluid thought-to-waveform morph; microphone pulse; foreground grocery-bag wipe. **Connection 1→2:** Clip 1 ends inside the expanding orange waveform; Clip 2 opens with that same waveform filling the frame. | “Your best ideas don’t arrive neatly. They tumble out as half-finished voice memos while your hands and attention are somewhere else.” | “你最好的想法并不会整齐地出现。当双手和注意力都被别的事情占据时，它们往往变成断断续续的语音备忘。” | Scattered plucks and soft ticking; notification ping; recording beep; rising waveform hum. |
| 10–20s | Escalate the pain of reviewing rambling audio | **0–3s:** The inherited waveform pulls back into a tangled orange wall. **3–7s:** The figure presses play and searches through knots containing a buried checkmark, question mark, and lightbulb. **7–10s:** The wall leans forward and collapses into a dense orange knot. Exact text: **“What was the task?”** | Camera pullback; waveform-to-wall transformation; magnifying-glass search; oversized knot metaphor; falling symbols; brief impact shake. **Connection 2→3:** Clip 2 ends on the centered orange knot; Clip 3 opens on the identical knot in the same position. | “Later, you press play and meet a wall of rambling audio: decisions buried, actions unclear, and useful thoughts easy to miss.” | “之后再播放时，你面对的却是一堵杂乱音频墙：决定被埋没、行动不明确，有用的想法也很容易漏掉。” | Beat becomes cluttered; overlapping murmurs; scrub clicks; low thump as the wall collapses. |
| 20–30s | Reveal the app and its core transformation | **0–3s:** A blue app frame draws itself around the inherited orange knot. **3–7s:** Blue scanning rings pass through it, separating strands into straight lines. **7–10s:** The lines snap into three green task cards. Exact text: **“Memo becomes tasks”**. | Shape-drawn interface; scanning light; knot-unravel metaphor; directional arrows; color shift from orange to blue to green; gentle camera orbit. **Connection 3→4:** Clip 3 ends with three stacked green cards; Clip 4 opens with those same cards sliding upward to expose the recorder. | “This notes app listens to that mess and reshapes it into a clear list of tasks, without asking you to organize first.” | “这款笔记应用会理解这些混乱内容，把它们重组成清晰的任务清单，而不需要你事先整理。” | Rhythm locks into a steady pulse; scanning shimmer; three satisfying card clicks. |
| 30–40s | Demonstrate the mechanism with a concrete memo | **0–3s:** The inherited cards slide up; the figure speaks into a blue recorder. **3–7s:** Three short speech bubbles travel through a funnel and separate. Exact bubble text: **“Call Maya”**, **“Move Friday’s review”**, **“Send revised deck”**. **7–10s:** Each phrase lands on its own green task card. | Upward card reveal; expressive speaking pose; speech-to-text bubbles; funnel diagram; motion-matched card drops; camera follows the final card downward. **Connection 4→5:** Clip 4 ends following the lowest card; Clip 5 opens with that same card landing at the top of a clean checklist. | “Record naturally: ‘Call Maya, move Friday’s review, and send the revised deck.’ The app separates each action into its own task.” | “自然地说：‘给 Maya 打电话、调整周五的评审时间，并发送修改后的演示文稿。’应用会把每个行动分别整理成任务。” | Warm bass joins; speech bubbles pop; funnel whoosh; three crisp task chimes. |
| 40–50s | Show the emotional and practical payoff | **0–3s:** The inherited card lands, completing a tidy checklist. **3–7s:** Orange fog around the figure is swept away by three blue arrows pointing toward the tasks. **7–10s:** The figure checks the first task; all three cards move forward like stepping-stones. Exact text: **“Clear next steps”**. | Card impact; environmental fog clearing; directional arrows; checklist metaphor; energetic step-forward pose; camera tracks a short central path. **Connection 5→6:** Clip 5 ends with the first green checkmark expanding; Clip 6 opens inside that same green checkmark. | “Now the fog becomes a plan you can scan, check, and act on—one thought captured, three next steps ready to move.” | “现在，迷雾变成了一份可以快速查看、勾选并执行的计划：一个想法被捕捉，三个下一步已经就绪。” | Music opens and brightens; airy sweep; checkmark ding; gentle forward-driving beat. |
| 50–60s | Return to the hook and close with action | **0–3s:** The inherited green checkmark pulls back into the app screen. **3–7s:** A new orange idea appears above the figure; they immediately tap record, and it flows through a blue line into a green task. **7–10s:** The figure takes one confident step onto the task card. Exact text: **“Speak. Clarify. Start.”** | Checkmark pullback; callback to orbiting idea; one-tap gesture; orange-blue-green flow diagram; short push-in; final light burst behind the confident pose. **Closing callback:** The messy idea from Clip 1 now completes the same journey into one clear first task. | “So keep speaking before the idea disappears. Let your memo stay messy; open the app, find the clarity, and start with one task.” | “所以，在想法消失之前尽管说出来。语音可以保持混乱；打开应用、找到清晰方向，然后从一个任务开始。” | Warm melodic resolution; recording beep callback; transformation shimmer; final soft chime. |

Please choose one:

- Approve this proposal and generate the six standalone Gemini Omni Flash prompts.
- Request revisions to a named scene or narration passage.
- Change a global setting such as aspect ratio, theme, palette, voice, or tone.
~~~~

### long-source

~~~~text
## Phase A｜导演提案

1. **English Title:** *Move Before Fear Wins*
   **中文参考标题：**《在恐惧赢之前，先行动》

2. **核心观点：**真正困住人的，往往不是现实中的困难，而是大脑预演出来的恐惧；打破焦虑循环的关键不是继续思考，而是立即迈出一个小步骤。
   **开场钩子：**“为什么明明还没开始，你却已经累坏了？”

3. **画面规格：**16:9 横屏；暗色主题——纯黑背景、白色火柴人和白色基础线条。

4. **旁白设定：**明亮、有能量的成年女性；自然美式英语；前半段略显紧绷，揭示观点后逐渐坚定。
   **语速与长度：**约 137 个英文单词；自然偏稳语速；预计 58–62 秒。

5. **强调色：**

   - 高饱和红色：焦虑、失败想象、危险警报
   - 电光蓝色：思维循环、心理牢笼
   - 明亮黄色：行动、突破、成长

6. **声音与叙事：**

   - **BGM：**极简电子脉冲起步，前半段加入低频心跳与持续张力；第四幕后和声打开；结尾转为轻快、有推进感的鼓点。
   - **情绪转折：**疲惫困惑 → 恐惧升级 → 被困 → 看清真相 → 立即行动 → 获得掌控感
   - **整体语气：**共情但不软弱，坚定而不说教。
   - **叙事结构：**强钩子 → 共鸣 → 升级 → 重构认知 → 行动方法 → 回扣与号召

## 六幕分镜

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | 中文参考翻译 | BGM / SFX |
|---|---|---|---|---|---|---|
| **0–10s** | 用“尚未开始却已筋疲力尽”建立强烈共鸣 | **0–3s：**画面左侧，白色火柴人瘫坐在桌前；右侧只有一张很小的待办卡，写着 **“ONE SMALL TASK”**。<br><br>**3–7s：**待办卡伸出红色线条，在人物头顶迅速缠成混乱线团；人物弯腰捂头，桌面随压力向下倾斜。<br><br>**7–10s：**红色线团膨胀并变形为一座巨山，人物被压到画面最左端；镜头横向拉远，突出右侧巨大负空间。 | 视觉装置：表情动作、环境倾斜、任务变山的隐喻、红色思维线、横向拉镜、形状变形。每 2–3 秒发生一次明显变化。<br><br>**衔接 1→2：**本幕结尾的红色山峰填满右侧；下一幕从同一山峰轮廓开始，轮廓裂成多个失败场景。 | “Do you ever feel exhausted before you have even begun? One small task appears, and your mind instantly turns it into a mountain.” | “你是否也会在还没开始前，就已经觉得筋疲力尽？一个小任务刚出现，你的大脑便立刻把它变成一座大山。” | 稀疏电子脉冲；轻微时钟声。线团出现时加入电流杂音；山体膨胀伴随低沉轰鸣。 |
| **10–20s** | 展现焦虑如何提前预演失败与他人评价 | **0–3s：**继承红色山峰；山体横向裂成三块悬浮屏幕，火柴人站在中央下方。<br><br>**3–7s：**左屏出现人物跌倒，中屏出现红色叉号，右屏出现几个指指点点的火柴人；蓝色箭头在三屏之间高速循环。<br><br>**7–10s：**所有屏幕朝人物压近；短词 **“WHAT IF?”** 在头顶闪现，人物后退一步，蓝色循环箭头收紧成圆环。 | 视觉装置：多屏环境变换、失败情境隐喻、循环箭头、他人互动、横向摇镜、屏幕向镜头推进、圆环形状匹配。<br><br>**衔接 2→3：**本幕结尾的蓝色圆环套住人物；下一幕直接继承圆环，并将它拉伸成牢笼栏杆。 | “Before your first step, you rehearse a hundred endings: What if I fail? What will people think? What if I embarrass myself?” | “第一步还没迈出，你就已经预演了无数种结局：万一失败呢？别人会怎么想？如果我出丑了呢？” | 节拍加速；问题出现时加入短促耳语和警报点击声；屏幕逼近时加入低频冲击。 |
| **20–30s** | 将“想象中的灾难”具象化为心理牢笼 | **0–3s：**蓝色圆环上下延展成牢笼；人物被锁在画面中央，笼外仍是空旷黑色空间。<br><br>**3–7s：**红色影子怪物沿栏杆游动；人物挥拳抵挡，却只击中空气，蓝色能量不断从身体流向栏杆。<br><br>**7–10s：**人物精疲力尽地跪下；怪物突然消散，露出栏杆其实只是几条悬浮的蓝色思想线。镜头推近其中一条线。 | 视觉装置：身体表演、牢笼隐喻、影子怪物、能量粒子、推镜、环境揭示、线条消散。<br><br>**衔接 3→4：**本幕结尾镜头贴近一条蓝色思想线；下一幕从同一条线继续横向移动，并揭示它来自人物自己的头脑。 | “Soon, those imaginary disasters become a cage. You stand completely still, drained by battles that have not happened and may never happen.” | “很快，那些想象中的灾难变成了一座牢笼。你被耗在原地，与尚未发生、甚至永远不会发生的战争搏斗。” | 心跳与低频持续增强；挥拳带空响；怪物消散时音乐突然抽空，只留下呼吸声。 |
| **30–40s** | 完成认知重构：现实未必最可怕，恐惧才是额外重量 | **0–3s：**镜头沿蓝线横移，发现它连接人物头部；右侧真实任务仍只是一张小卡片。<br><br>**3–7s：**人物头顶的红蓝恐惧云被放上天平一端，小任务在另一端；恐惧云将天平重重压下。屏幕出现 **“FEAR ADDS WEIGHT”**。<br><br>**7–10s：**人物伸手拔掉连接恐惧云的蓝线；云团缩小，天平恢复平衡，一颗黄色光点从小任务中亮起。 | 视觉装置：横向跟拍、来源揭示、天平隐喻、恐惧云变形、关键词、拔线动作、黄色光粒子。<br><br>**衔接 4→5：**本幕结尾的黄色光点向右飞出；下一幕由同一光点落地，变成第一块行动踏板。 | “Here is the truth: reality is often not what hurts most. The fear your mind creates can feel heavier than the thing itself.” | “事实是：最让你痛苦的往往不是现实。你的大脑制造出来的恐惧，可能比事情本身更加沉重。” | 音乐停止下坠并加入温暖和声；拔线时一声清脆断裂；黄色光点出现时加入明亮提示音。 |
| **40–50s** | 给出具体解法：用微小、立刻可做的动作切断循环 | **0–3s：**黄色光点落在左侧，展开为踏板；人物踩上去，牢笼残线在身后碎裂。<br><br>**3–7s：**人物横向奔跑，每一步生成一个黄色动作图标：电话、打开的文档、第一条短线；蓝色循环箭头被脚步逐段踩断。<br><br>**7–10s：**人物停在画面右侧，果断按下写有 **“START NOW”** 的黄色按钮；按钮向镜头迅速放大。 | 视觉装置：人物奔跑、踏板生成、动作图标、循环箭头断裂、粒子碎片、横向追踪、按钮前景遮挡。<br><br>**衔接 5→6：**本幕结尾的黄色按钮填满画面；下一幕从同一黄色圆形缩回，成为向前道路上的太阳。 | “You cannot defeat anxiety by thinking through every possible outcome. Break the loop with action. Make the call. Open the document. Begin badly.” | “你无法靠想遍所有可能性战胜焦虑。用行动打破循环：打出电话，打开文档，哪怕开始得并不完美。” | 鼓点正式进入；每次落脚配合清脆节拍；箭头断裂加入连续碎裂声；按钮按下时产生有力重音。 |
| **50–60s** | 行动号召并回扣开场：移动本身就是胜利 | **0–3s：**黄色圆形缩成远处太阳；人物从左侧迈出第一步，脚下只出现一小段黄色道路。<br><br>**3–7s：**每迈一步，道路便继续生长；人物短暂跌倒后立刻起身，身后长出小芽。画面出现 **“TRY. FAIL. GROW.”**<br><br>**7–10s：**现在的火柴人走到右侧高处，回头看见开场时那个仍瘫坐桌前的灰白轮廓；他向前跨出一步，黄色光芒扫过全屏，最后定格 **“MOVE BEFORE FEAR WINS”**。 | 视觉装置：道路生成、跌倒与起身、成长幼芽、过去自我的互动、横向拉远、光芒扫屏、首尾回扣。<br><br>**结尾闭环：**开场“尚未开始便被大山压住”的人物，在结尾通过一个小步骤越过静止的旧自己；中央观点得到视觉兑现。 | “Don’t wait until you feel ready. Take one step. Try, make mistakes, and grow. Once you move, you beat the version that stayed stuck.” | “别等到自己感觉准备好了。先迈出一步，去尝试、去犯错、去成长。一旦开始行动，你就已经战胜了那个困在原地的自己。” | 明亮推进型节奏；跌倒时短暂停顿，起身后鼓点回归；最终跨步加入上扬音效与温暖收束和弦。 |

请明确选择下一步：

- **批准当前提案**，继续生成六条独立的 Gemini Omni Flash 提示词；
- 指定需要修改的场景或旁白；
- 修改全局设置，例如画幅、主题、配色、声音或语气。
~~~~

## Final scenario revisions

No additional Skill wording was required. All remaining setup, approval, recomposition, aspect-ratio, expansion, and condensation scenarios passed.
