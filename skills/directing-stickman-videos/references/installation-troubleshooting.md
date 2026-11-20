# Manual installation and troubleshooting / 手动安装与排障

## Install from the terminal / 终端安装

Requires Node.js/npm and Git. The installer asks which agent and installation scope to use.

需要 Node.js/npm 和 Git。安装器会询问要安装到哪个 Agent，以及安装范围。

```sh
npx skills add kaomei/stickman-video-director --skill directing-stickman-videos
```

## Skip the README showcase videos / 跳过 README 展示视频

Use a sparse checkout to skip the README showcase videos and retrieve the Skill folder and the repository's top-level files. Run these commands from the same parent directory with Git 2.25 or newer. They also work in PowerShell.

通过稀疏检出跳过 README 展示视频，只检出 Skill 文件夹和仓库顶层文件。请使用 Git 2.25 或更新版本，在同一父目录执行以下命令。PowerShell 也适用。

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/kaomei/stickman-video-director.git stickman-video-director
git -C stickman-video-director sparse-checkout set skills/directing-stickman-videos
npx skills add ./stickman-video-director --skill directing-stickman-videos
```

You can delete the downloaded `stickman-video-director` folder if the installer copied the Skill elsewhere. Keep the folder if the installation links to files inside it.

如果安装器已将 Skill 复制到独立目录，可以删除下载的 `stickman-video-director` 文件夹。如果安装通过链接引用其中的文件，请保留该文件夹。

## Clone timeout / 克隆超时

If installation reports a repository clone timeout, retry with a 20-minute clone window. Run the commands in a terminal with Node.js/npm and Git available, then select the same agent and installation scope as before.

如果安装提示仓库克隆超时，可延长等待时间至 20 分钟后重试。在已安装 Node.js/npm 和 Git 的终端执行，安装时沿用原来的 Agent 和安装范围。

### macOS / Linux

```sh
SKILLS_CLONE_TIMEOUT_MS=1200000 npx skills add kaomei/stickman-video-director --skill directing-stickman-videos
```

### Windows PowerShell

```powershell
$env:SKILLS_CLONE_TIMEOUT_MS = "1200000"
npx skills add kaomei/stickman-video-director --skill directing-stickman-videos
```

## Local clone fallback / 本地克隆备用方式

If the installer still times out, clone to a new local directory first, then install from that path. Run both commands from the same parent directory; this also works in PowerShell.

如果安装器仍超时，可先克隆到一个新的本地目录，再从该路径安装。以下两条命令在同一父目录执行，PowerShell 也适用。

```sh
git clone --depth 1 https://github.com/kaomei/stickman-video-director.git stickman-video-director
npx skills add ./stickman-video-director --skill directing-stickman-videos
```

If `git clone` itself fails, resolve the reported network or Git error before retrying. After installation succeeds, read the installed `SKILL.md` and continue with the [first-use guide](getting-started.md).

如果 `git clone` 本身失败，先根据报错解决网络或 Git 问题再重试。安装成功后，读取安装目录中的 `SKILL.md`，继续[首次使用引导](getting-started.md)。
