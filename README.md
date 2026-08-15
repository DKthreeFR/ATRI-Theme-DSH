# ATRI 主题插件 · `@deepseek-ai/dsh-client-ui-atri`

《ATRI -My Dear Moments-》主题的 DeepSeek Harness Web 界面美化插件。绝大部分功能是**纯视觉主题**，放进 profile 即用；只有「UI 界面设置」和「侧栏加宽 15px」需要给核心打一个小补丁。

## 功能

- 背景壁纸 + 橄榄绿/向日葵金配色（深浅两套）
- 左上角 `ATRI HARNESS` + `アトリ` 徽章 + Atri 图标
- 右下角标题流光动效（带开关）
- 新对话空态：Atri 图标 + 「向着那亲爱的每一天」
- 侧栏底部标签、工作区图标、「My Only Memories~」小字
- 文案替换：Session log → 下载回忆、推理等级、输入框占位符、发送按钮等
- 链接 / 轨迹选中 / 思考状态 / 对话·轨迹标签选中 的颜色
- **UI 界面设置**：毛玻璃程度、特殊主题色 ×2、标题颜色、发送按钮颜色、输入框不透明度、流光开关（各带重置按钮）

## 目录结构

```
atri-plugin/
├── package.json
├── README.md            ← 本文件
├── setup-npx.mjs        ← npm/npx 安装版用的一键补丁脚本
├── lib/
│   ├── client.js        ← 全部视觉主题 + 设置页逻辑
│   └── index.js         ← node 半（注册 atri-ui 设置命名空间）
└── patches/
    └── core.patch       ← 源码版用的核心补丁
```

---

# 安装方式

## 第一步（两种方式通用）：拉去项目 把插件放进 profile

1. 把 `dsh-client-ui-atri` 整个目录复制到你的 profile：

   - Windows：`C:\Users\<你>\.dsh\profiles\web\node_modules\@deepseek-ai\dsh-client-ui-atri\`
   - Linux / macOS：`~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-atri/`

2. 在 web 的 `cordis.patch.yml`（和上面 `web` 同级，即 `~/.dsh/profiles/web/cordis.patch.yml`）里注册：

   ```yaml
   - insert:
       - id: ui-atri
         name: '@deepseek-ai/dsh-client-ui-atri'
   ```

> 做完这一步，**纯视觉主题（壁纸、配色、品牌区、图标、文案替换、链接/轨迹/思考颜色等）就已经生效了**。下面的第二步只是为了让「UI 界面设置」页和「侧栏加宽」可用。

##第二步：启用「UI 界面设置」+「侧栏加宽 15px」

### 方式 A：源码运行（`pnpm dsh web`，你有 checkout）

在你的 checkout 根目录就是（**ATRI-Theme-DSH**下）执行：

侧边栏加宽主要是为了展开显示完全

```bash
git apply /path/to/atri-plugin/patches/core.patch
pnpm build:lib:host     # 让 atri-ui 设置命名空间生效
pnpm build:lib:client   # 让侧栏加宽 15px 生效
pnpm dsh web            # 重启
```

### 方式 B：npm / npx 安装运行（`npx @deepseek-ai/dsh web` 或 `dsh web`）

```bash
node /path/to/atri-plugin/setup-npx.mjs
```

脚本会自动在「全局 npm 目录」和「npx 缓存目录」里找到 `dsh-host-apiproxy` 和 `dsh-client-ui-layout` 并修改。如果找不到，手动指定 node_modules 根目录：

```bash
node /path/to/atri-plugin/setup-npx.mjs "<node_modules 根目录>"
```

然后重启 `dsh web`，浏览器 `Ctrl+Shift+R` 强制刷新。

> 注意：npm/npx 安装版的补丁是改在已安装的包里的，**重新安装 / 升级 dsh 后会失效**，需要重新跑一次脚本。源码版用 `git apply` 则会一直留在你的改动里。

- ​
