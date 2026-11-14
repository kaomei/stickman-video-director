# Installation troubleshooting / 安装排障

If installation reports a repository clone timeout, retry with a 20-minute clone window. Run the commands in a terminal with Node.js/npm and Git available, then select the same agent and installation scope as before.

如果安装提示仓库克隆超时，可延长等待时间至 20 分钟后重试。在已安装 Node.js/npm 和 Git 的终端执行，安装时沿用原来的 Agent 和安装范围。

## macOS / Linux

```sh
SKILLS_CLONE_TIMEOUT_MS=1200000 npx skills add kaomei/stickman-video-director --skill directing-stickman-videos
```

## Windows PowerShell

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
