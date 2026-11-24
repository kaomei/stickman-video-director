# B8 本地独立交付

适用于已有 B8 `project.json` 和项目本地 `b8/` 运行时的工程。旧项目先核对入口与数据兼容性，不为打包重建工程或使旧批准失效。沿用[已确认样片标准](b8-approved-standard.md)、原文原速完整音轨、有效素材和批准；不为打包另做测试片、重渲染或生成媒体。制作和审查步骤见[安装后流程](b8-installed-workflow.md)。导出不发布，也不扩大制作、付费或发布授权。

## 从现有工程导出

从 Skill 根目录执行，或使用该脚本的绝对路径：

```sh
node scripts/autopilot.mjs deliver /absolute/project --output /absolute/new-delivery --film outputs/film-v1.mp4 --review /absolute/project/outputs/film-v1.report.json
```

实际接口为 `deliver PROJECT --output NEW_DIR [--film PROJECT_RELATIVE_MP4] [--review REPORT]`。使用原工程外的新输出目录，两者不能互相包含，保留原工程和旧交付；指定 `--film` 时使用工程内相对路径，报告须位于工程内并对应实际视频与审查范围，不用旧报告冒充当前成片。交付前先执行现有 `validate PROJECT --review REPORT` 只读终检，修复实际文件、指纹或审查记录的失败项。

导出目录包含：

| 路径 | 用途 |
|---|---|
| `index.html` | 本地交付入口，打开查看成片、相关文件与已记录审查状态。 |
| `delivery-manifest.json` | 交付文件清单、指纹及来源/审查信息。 |
| `project/` | 完整独立工程副本，保留计划、素材、声音、字幕、参考、报告与项目本地 `b8/` 运行时。 |

交付包内运行素材与入口使用可随目录搬迁的相对关系。已哈希的计划、报告保留原文，不为美化路径改写而破坏证据；其中旧绝对 `output` 可以只是历史描述，不能因此误判依赖外部文件。真正参与运行而位于工程外的依赖必须先整理到工程内，并按受影响范围核对指纹与批准；不能靠把路径字段改成相对形式假装已经独立。

## 在接收环境继续运行

复制整个交付目录，保留 `project/` 的完整结构。使用该环境已配置 B8 依赖的 Python：

```sh
python3 /absolute/new-delivery/project/b8/run.py doctor
python3 /absolute/new-delivery/project/b8/run.py validate
```

`run.py` 默认定位同一工程，支持现有制作命令和参数；渲染脚本、字体、`requirements.txt` 与 `runtime-manifest.json` 随项目保留，不依赖原安装路径。Python、Pillow、NumPy、SciPy 和 FFmpeg/FFprobe 仍是接收环境依赖，按获准方式配置。doctor 只检查本地渲染环境，不调用生成，也不核验绘图工具或画风。新绘图需求由当前代理实际核对可用工具及参考图能力，沿用已有审批边界。

搬移后若要继续绘图，先从当前工程重新导出 prompts，再把其中当前有效的 `reference_paths` 附给绘图工具。旧 `outputs/drawing-prompts.json` 可能保留原位置的绝对附图路径；它属于历史导出，不是运行器的输入依赖，不直接沿用旧路径，也不改写已被审片报告哈希绑定的文件。选择尚不存在的输出文件名，例如：

```sh
python3 /absolute/new-delivery/project/b8/run.py prompts --output outputs/drawing-prompts-relocated-v1.json
```

此命令只根据项目内相对素材、角色与共同画风参考重新导出绘图任务，不生成图片、不重建视觉标准，也不替代或新增用户批准。交付清单中的 `historical_locations` 单列旧绝对位置；`input_dependencies` 仅列本工程内经哈希核对的实际输入。

## 交付核对与状态

- 核对 manifest 中列出的文件与 SHA-256、实际成片和报告对应关系，打开 `index.html`，确认移动后的相对媒体链接有效。打包与文件检查不等于视觉、听音或用户验收。
- 有旁白或仅配置完整 master 的有声工程都须核对完整已确认脚本及对齐字幕。字体指纹、真实 cmap 字形覆盖、安全区与无重叠时序是代码检查；语义断句、实际语音停顿、阅读速度及编码画面的可读性仍须实际审阅。
- 保留逐镜视觉审查、完整正常速度回放、实际听音与用户验收各自的真实状态。显式 failed 先修，未完成保持 pending；导出包、代理写记录或用户认可某个画面都不能补签其他验收。
- 给用户成片预览或文件链接时，同时给经核实存在的视频所在文件夹绝对路径链接，并附交付包文件夹入口。保留旧版本，不将本地打包说成已发布。
