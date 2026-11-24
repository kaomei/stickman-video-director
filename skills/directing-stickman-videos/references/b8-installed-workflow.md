# B8 安装后执行流程

B8 是 `directing-stickman-videos` 内的一条路线，安装入口与 B1–B3 相同。B8 使用独立的绘制素材分层运行时，不继承通用静图画面的推拉。新角色和准确姿势由代理调用当前可用、能接收参考图的绘图工具制作；运行时不会从一句话自动推断人物骨骼，也不调用配音或付费服务。

## 一次选择 B8 后的默认行为

先读 [认可标准](b8-approved-standard.md)和[默认视觉检查](b8-visual-quality-gates.md)，实际看附带的画风板、接触板及横屏/竖屏实片。继续旧工程时先读既有 checkpoint，沿用角色、原文、完整配音、素材指纹和有效批准。不要为本流程重建旧工程；旧项目渲染器仍可保留，或只迁移获准镜头到本运行时。

已确认样片是默认制作标准的来源，按[样片到制作方法的对应表](b8-approved-standard.md#从已确认样片反推制作标准)直接执行。新故事在本项目已有的提案、关键姿势与获准短动画中对照修正；不把另做测试片或重批固定画风设为采用标准的前提。

1. **完整范围的导演设计。** 代理根据当前故事与实际语音停顿编排全段 shot ledger。明确每镜的新信息、场景连接、景别、构图、独立层、有限运镜和停点、动作与反应。按目标画幅原生设计；9:16 单独记录可见动作、接触/结果与全身或近景意图，核对首中尾、最大位移和字幕安全区，不继承横屏构图批准。全身须完整到脚并落地，近景不能露出半身贴图的平底。对可能重复的场景/动作检查是否有新信息；按剧情安排环境建立、细节插镜、俯视/越肩、人物反应和远景后果，不固定镜数或强行换地点。
2. **共同画风、独立身份。** 为全部出场角色填写 `characters` 的身份、部位连接/肤色/服饰契约。所有绘图任务自动带同一个 B8 drawing-family anchor、实际参考图路径、该角色完整身份与当前姿势；有已认可的角色参考时一起附图。先把全体角色放在同一张 cast/style board 并排审阅。新角色不能偷偷换成写实手或另一套线重；也不能用同一个迈达斯造型替代所有人。
3. **因果与附带接触。** 逐镜列出主要和附带接触、完整作用对象、支撑/持有者、前后状态和跨镜去向。`contact_audit` 必须说明袖口、桌帘、杯盘等可见接触，或明确本镜无接触及依据。规则未知先标明，不能虚构例外填漏洞。接近→接触→变化→结果→反应按实际事件安排，不机械平均语句或强制每镜有手。
4. **具体提案给用户看。** `proposal` 导出逐镜图、同板角色、关键姿势示意、UTF-8 完整逐镜表及待绘图任务。每镜须先绘制一张完整构图草图，登记 `proposal_composition_asset`；导演板优先展示该完整构图，缺失时标出 COMPOSITION REQUIRED，不能将分层素材排列当成构图批准。人物板并排放共用 B8 画风参考与各自角色。代理须实际检查并补成可判断构图和动作的板图，再展示给用户。导出文件或检查通过不等于批准。用户批准该版本后记录 `approve --stage proposal`，不重复问固定画风。
5. **准确关键姿势。** 按已批提案调用绘图工具，实际附上 `drawing-prompts.json` 中参考图；逐个动作绘制完整掌—腕—前臂或持物人物 cel。复用有效素材；缺姿势则补画，复杂动作用接触插镜、物体结果、人物反应组织。区分角色身体自身左/右与画面左/右，核对掌心/拇指、握点、腕—肘回接身体的归属、袖口、肤色及手与脸的简化程度，并与全身参考并排检查；不能只镜像不对称人物或道具来换方向。再在素材 `review` 和导出报告 `quality_review` 中记录实际查看的证据。导出 `keyposes`，给用户看准确姿势；确认后记录该范围批准。
6. **短动画→获授权成片。** 用完整 cel 的有限位移/旋转、注册姿势/表情切换、接触起点的局部材质传播与共同相机处理空间。核对整个路径与停点中脚底—地面/阴影、手—物、物—支撑面的空间关系，以及同平面背景的共同运动；不让人物脚滑、整人绕脚旋转、独立底图无动机横漂或停稳后继续飘。静止反应可以成立。复用仍有效的已编码短动画；缺少当前动作证据时，先生成获准范围内受影响段的短测试，查实际编码帧及正常速度播放，修自然度/因果/节奏问题再交用户。样片认可和后续制作授权分别记录；`--authorize-through` 只记录用户实际批准扩展的结束时间。全部新镜头仍需有效提案与准确姿势批准。
7. **成片检查与本地交付。** 技术、逐镜观感、正常速度回放、实际听音和用户验收分别记录。有旁白或仅有完整 `audio_master` 的有声工程均须提供已确认全文及对齐字幕；字幕按语义和实际语音停顿断句，不按词数切段。核对真实字体字形覆盖、固定字号下的安全区和实际编码阅读效果。局改只动受影响镜头和批准，保持原速音轨。按[本地交付说明](b8-local-delivery.md)导出独立工程包，交付视频与所在文件夹链接。

`proposal`、`keyposes`、`preview`、`render` 导出的报告自动附逐镜 `quality_review`：提案检查共同画风与目标画幅构图，关键姿势增加身体左右/手臂方向，视频再增加空间运动，所需项初始均为 pending。代理实际审阅后记录 reviewer、具体说明和绑定该报告 artifacts 的 SHA-256 证据；视频构图、方向与空间项须引用实际 MP4。不适用项依[视觉检查规范](b8-visual-quality-gates.md)说明原因与证据，不能把固定镜头的空间稳定检查全部略去。现有 `approve` 在写入新批准前核查记录，pending/failed 阻止该次批准，并把已审报告冻结成绑定 SHA-256 的独立快照；后续补审原待审报告不撤销旧局部批准。它不代替用户消息，也不新增用户审批阶段。未改变镜头的有效历史批准继续复用。

代理可以编写当前故事的画面、调度并完成这些审查记录；上述步骤不是要求用户手填 JSON。工具确实缺失时说明具体缺口，保留计划/素材和下一步；不要退回静图轮播或声称已达到样片观感。新生成素材、付费、发布继续遵循当前授权。

## 本地可执行入口

从安装后的 Skill 根目录执行，或由代理用其绝对路径调用：

```sh
node scripts/autopilot.mjs doctor --style B8
node scripts/autopilot.mjs init /absolute/new-story --style B8 --ratio 9:16
node scripts/autopilot.mjs proposal /absolute/new-story
node scripts/autopilot.mjs approve /absolute/new-story --stage proposal --review /absolute/new-story/outputs/b8-review/VERSION/review-manifest.json --note '实际用户确认消息'
node scripts/autopilot.mjs keyposes /absolute/new-story
node scripts/autopilot.mjs approve /absolute/new-story --stage keyposes --review /absolute/new-story/outputs/b8-review/VERSION/review-manifest.json --note '实际用户确认消息'
node scripts/autopilot.mjs preview /absolute/new-story --seconds 5 --output /absolute/new-story/outputs/contact-test-v1.mp4
node scripts/autopilot.mjs approve /absolute/new-story --stage sample --review /absolute/new-story/outputs/contact-test-v1.report.json --note '实际认可样片及授权后续的用户消息' --end 5 --authorize-through 20
node scripts/autopilot.mjs render /absolute/new-story --output /absolute/new-story/outputs/film-v1.mp4
node scripts/autopilot.mjs validate /absolute/new-story --review /absolute/new-story/outputs/film-v1.report.json
node scripts/autopilot.mjs deliver /absolute/new-story --output /absolute/new-delivery --film outputs/film-v1.mp4 --review /absolute/new-story/outputs/film-v1.report.json
```

时长和比例仅为命令示意，必须按故事、目标画幅和实际授权调整；`--start/--end` 可限制局改。`prompts PROJECT --output outputs/prompts-v2.json` 可另导出附参考的绘图任务。不会覆盖既有工程、板图或成片。批准绑定实际板图/视频、全局身份/音轨设定及各镜指纹；局部调度改变使受影响镜头批准失效，未变镜头的有效记录继续使用。身份、台词、声音等全局变化须复核相关范围。`validate PROJECT --review REPORT` 只读核对当前指纹、产物及逐镜记录，并阻断显式的 visual/technical/listening failed；它不写批准、不新增用户关口，也不自动识别画面好坏。回放、听审和用户验收的 pending 仍表示未完成，不能因验证或打包通过补签。

### 项目本地运行入口

`init` 自动生成项目内 `b8/run.py`、运行脚本、字体、`requirements.txt` 和 `runtime-manifest.json`，与项目素材及参考一起保留。项目可在不依赖原 Skill 安装目录的情况下继续运行；Python 与 FFmpeg 等系统依赖仍须在接收环境配置。旧工程沿用原入口，不为取得启动器重建工程或使既有批准失效。

```sh
python3 /absolute/new-story/b8/run.py doctor
python3 /absolute/new-story/b8/run.py validate
python3 /absolute/new-story/b8/run.py proposal
```

本地入口默认自动定位所在工程，不依赖当前工作目录；也支持命令后的显式 `PROJECT`。`proposal`、`keyposes`、`prompts`、`validate`、`approve`、`preview`、`render` 延用原有参数和批准边界。交付打包用上面的 Node `deliver` 入口，不把生成启动器或依赖检查当作视觉验收。

### 依赖

Python ≥3.9、Pillow、NumPy、SciPy、FFmpeg/FFprobe（须有 libx264）。B8 本身不需要 Canvas/Sharp，也不需要 API key 才能复现附带样片。测试版本见 `scripts/requirements-b8.txt`，新项目本地副本为 `b8/requirements.txt`；这些是显式安装清单，不会自动安装。按当前环境获准的安装方式在独立环境中配置，`B8_PYTHON` 或 `--python` 可指定 Node 入口调用的解释器，`FFMPEG`/`FFPROBE` 可指定程序。不要改变其他 B 路线的环境。

`doctor` 检查本地渲染依赖、基准文件及项目运行时完整性，不调用绘图、配音或付费生成。当前代理另行发现实际可用绘图工具并核实能否接收真实参考图；doctor 不证明该工具可用，也不验证画风。字体缺字检查使用随运行时附带的 cmap 解析，不新增 Python 依赖。开发/安装回归用 `npm run test:b8` 集中运行 B8 Node 与 Python 检查；原 `npm test` 和其他画风入口保持原有范围。合成测试验证接口边界，不要求用户另做测试片，也不替代已确认样片的默认标准。

### 认可样片的独立复现

```sh
node scripts/autopilot.mjs demo --style B8 --output /absolute/new-folder/midas-replay.mp4
```

此命令从 `assets/b8/midas-replay-v1` 的独立场景/人物/道具/遮罩重新渲染完整 20 秒，并沿用原完整混音 1x；不是复制已编码样片，也不读取原工程。只复现已认可的 Midas 编排，不把树枝、桌子、时间码或角色强套新故事。字幕为原片字形遮罩，不分发系统字体；原混音、对齐旁白和原录音保留指纹。运行结果仍是本次复现的技术证据，不补签独立听审。

### 新故事项目数据

`init` 已生成 `project.json`、同一个 `checkpoint.json` 和项目本地运行时 `b8/`；旧项目可把 `checkpoint` 指到项目内既有状态文件，所有流程记录进入其中 `b8_pipeline`，不另建矛盾状态。所有运行依赖的媒体用项目内相对路径和 SHA-256。最小可执行新故事示例见 `examples/b8/new-story-project.json`：其素材为刻意简单的合成测试图，只验证接口，不代表 B8 画风。

- `characters`: `{id, identity, regions}`，可加 `references` 作为该角色已认可图片路径。`drawing_family.references` 为实际共用画风参考。
- `assets`: ID→`{path, sha256, kind, character_id?, whole_pose?, review?}`。`kind` 为 background/cel/prop/mask；人物 cel 为完整绘制单元。人物素材的 `review` 记录 `status: accepted, asset_sha256, reviewer, notes`，代理必须先实际看图，不能仅为通过门槛填 pass。
- `shots`: 完整 `start/end`、scene/framing/information_change/camera_motivation/action/reaction/contact_audit、characters、contacts、`proposal_composition_asset`（assets 中的完整构图草图 ID）及 layers。草图仅用于导演提案，不因获批而成为最终动画。接触 `phase_times` 为故事绝对秒，材质/keyframe/state 时间为镜内秒。接触记录应注明 `layer_id` 对应实际变化层，避免变化早于接触。
- `drawing_states`: 用当前故事的实际动作命名绘图状态，可为顺序文本数组，或 `{characters: {角色ID: [...]}, props: {道具ID: [...]}, background: [...]}`；接触记录可单独提供 `states_to_draw`。已经握住→松开→收回时按这三个状态绘制，不重套伸手动作。`props` 可列 `{id, description, references?, states_to_draw?}`，`background_prompt` 描述该镜空间。导出任务同时覆盖角色、背景和道具，标出可复用素材，不强制重绘有效资源。
- `layers`: 既有图像 ID、x/y、width、depth、z、anchor，及局部 keyframes、整张 states、registered material；格式见 `scripts/b8_scene.py` 顶部和示例。相机为共同的 `[tx,ty,zoom]`，按 depth 处理纵深；同一实体平面用同一 depth。旋转用弧度。素材保持比例，禁止骨骼、拉长胳膊或非等比变形。持续停顿可说明 `hold_reason`，不为让每秒都动而乱飘。
- `narration` 为原完整录音 `{path,sha256,speed:1}`，`audio_master` 可指已确认完整混音；有 master 时直接沿用，不擅自重混。只配置 master 的有声工程同样须提供完整已确认 `script` 和 `captions`，不能因未单列 narration 跳过字幕。`captions` 是 `{start,end,text}` 的语义断句与实际对齐，按当前运行时单行且不重叠；既有项目另有已确认行数规则时保留对应绘制分支，不将单行当作语义合格证明。`caption_style` 指项目内字体及指纹/字号/基线。默认附带 Noto Sans，仅覆盖其实际字形；验证会检查实际字体 cmap，缺字须换用经核实且合法可随项目交付的字体。核对完整原文无漏字、重字、错序，检查相邻 cue 的意群、实际时间与阅读效果；不能以字体能打开、有非空边界框或代码验证通过代替这些审阅。

`b8_scene.py` 只执行提供的图像和调度，验证结构与已记录审阅；它不识别解剖、画风或故事真伪。因此板图、准确姿势和实际动画的视觉检查不可省略。

## 当前成片的通用完整性与独立验收

制作 B8 时默认按已选样片编排完整语义字幕、有因果的音效和适合剧情的背景音乐，保留其手绘角色、整姿接触、分层空间与原生横竖构图。声音素材优先检索[已安装 B 模式声音库](b-audio-library.md)，按当前剧情动作导出实际使用文件、逐项许可依据与署名；保留各风格参考曲目的方向。已有有效音轨和样片不为规则同步而替换，样片中的曲目也不因此自动取得新用途许可。

在原生 `review-report` 检查之外，完成[通用交付完整性门禁](b-delivery-completeness.md)。由 Agent 关联实际编码文件的 B8 `greek` 原生收据和原始逐镜审查报告，使用 `b-style-acceptance-index/1` 索引，不把原生审查改成通用的全绿列表。通用检查会读取报告内部的实际影片 SHA-256、尺寸/画幅、逐镜视觉记录和失败项；当前字幕、SFX、BGM 的计划与实际文件也必须绑定同一影片。外层写 pass、仅放背景音乐下载链接、仅存在未使用音轨或编码成功都不算完成。

```sh
node scripts/b-delivery-completeness.mjs init --style B8 --ratio 16:9 --media /absolute/current-film.mp4 --output /absolute/new-completeness-review.json
node scripts/b-delivery-completeness.mjs check /absolute/completed-completeness-review.json
```

使用实际要求的画幅，不能复用另一画幅的验收。Agent 必须对当前编码结果从开头到结尾正常 1× 连续看画面，并实际听最终编码音轨，逐段记录观察、字幕动画/可读性、音效因果/同步和配乐进入/退出及平衡。未检查留 pending/not_checked，失败项返修；全程覆盖和真实观察不能由拼板、静帧、波形或渲染退出码代替。

`assets/b8/release-readiness.json` 是本地候选发布状态，不是新的用户填表要求；初始保持未完成。既有横竖样片的具体视觉认可保留原范围，不扩展成一次新全片试听、后续故事或另一版输出的认可。影片、字体、音轨、脚本或计划变更后须重建当前指纹关联，并核验受影响部分及完整最终结果。安装、打包、完整性技术核验、实际画面/听音、用户约定的认可和发布授权分别记录，不能互相补签。
