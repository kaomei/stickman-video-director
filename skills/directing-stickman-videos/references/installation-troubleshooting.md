# Manual installation and troubleshooting / 手动安装与排障

## Install from the terminal / 终端安装

Requires Node.js/npm and Git. The installer asks which agent and installation scope to use.

需要 Node.js/npm 和 Git。安装器会询问要安装到哪个 Agent，以及安装范围。

```sh
npx skills add kaomei/stickman-video-director --skill directing-stickman-videos
```

## Smaller download: only the Skill folder / 更小的下载：只下载 Skill 文件夹

The repository also contains about 300 MB of README showcase videos that the Skill does not use. These commands download only the Skill folder: about 445 MB instead of about 660 MB. They need Git 2.25 or newer and also work in PowerShell. Run them from the same parent directory.

仓库里还有约 300 MB 的 README 展示视频，Skill 本身用不到。以下命令只下载 Skill 文件夹：约 445 MB，而不是约 660 MB。需要 Git 2.25 或更新版本，PowerShell 也适用。请在同一父目录执行。

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/kaomei/stickman-video-director.git stickman-video-director
git -C stickman-video-director sparse-checkout set skills/directing-stickman-videos
npx skills add ./stickman-video-director --skill directing-stickman-videos
```

After installation, you can delete the downloaded `stickman-video-director` folder.

安装完成后，可以删除下载的 `stickman-video-director` 文件夹。

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
