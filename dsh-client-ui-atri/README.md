# @dkthree/dsh-client-ui-atri

《ATRI -My Dear Moments-》主题的 DeepSeek Harness Web 界面美化插件。

## 一键安装

```bash
npx @dkthree/dsh-client-ui-atri install
```

然后重启 `dsh web`，浏览器 `Ctrl+Shift+R` 强制刷新，主题即生效。

（可选）启用「UI 界面设置」+「侧栏加宽 15px」：

```bash
npx @dkthree/dsh-client-ui-atri patch
```

## 功能

- 全屏 ATRI 背景壁纸 + 橄榄绿 / 向日葵金配色（深色 / 浅色两套）
- 左上角 `ATRI HARNESS` + `アトリ` 徽章 + Atri 图标
- 右下角标题流光动效（带开关）
- 新对话空态：Atri 图标 +「向着那亲爱的每一天」
- 侧栏底部标签、工作区图标、「My Only Memories~」小字
- 文案替换：Session log → 下载回忆、推理等级（笨蛋机器人 / 萝卜子 / 高性能です！）、输入框占位符、发送按钮等
- 链接 / 轨迹选中 / 思考状态 / 对话·轨迹标签选中的颜色
- **UI 界面设置**：毛玻璃程度、特殊主题色 ×2、标题颜色、发送按钮颜色、输入框不透明度、流光开关（各带重置按钮）

## 命令

| 命令 | 作用 |
| --- | --- |
| `install` | 把插件复制进 web profile 并注册到 `cordis.patch.yml`（纯视觉主题，装完即用） |
| `patch` | 给核心打补丁：`atri-ui` 设置白名单 + 侧栏加宽 15px |
| `uninstall` | 从 `cordis.patch.yml` 移除 `ui-atri` 注册（保留目录，安全） |
| `help` | 显示帮助 |

> 可用环境变量 `DSH_HOME` 覆盖 profile 根目录（默认 `~/.dsh`）。

## 卸载

```bash
npx @dkthree/dsh-client-ui-atri uninstall
```

> ⚠️ 不要只删插件目录。`cordis.patch.yml` 里还注册着插件时，DSH 启动会报 **Failed Loader**。请先用 `uninstall` 移除注册，再手动删目录。

## 说明

- 「UI 界面设置」和「侧栏加宽」依赖对核心包（`dsh-host-apiproxy` / `dsh-client-ui-layout`）的小补丁，由 `patch` 命令完成；**重新安装 / 升级 dsh 后需重跑一次 `patch`**。
- 补丁修改的是已安装的包文件，源码运行的场景请改用仓库里的 `patches/core.patch`（`git apply`）。

完整文档与截图见 [GitHub 仓库 README](https://github.com/DKthreeFR/ATRI-Theme-DSH)。

## 许可证

MIT © 2026 DKthreeFR
