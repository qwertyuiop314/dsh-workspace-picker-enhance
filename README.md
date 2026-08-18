# dsh-workspace-picker-enhance

> **Enhanced Workspace Directory Picker for DeepSeek Harness** — 为 DSH“选择工作区”面板增加跨盘符/挂载点浏览、面包屑一键跳转、手动输入模式，以及无权限/系统目录视觉提示。

为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的“选择工作区”目录选择器提供增强能力。它通过 DSH 官方 UI 插槽注入，不修改 DSH 核心代码，也不修改原生日录选择器源码；卸载后原界面可完全恢复。

## 功能 / Features

- **跨盘符 / 挂载点浏览**
  - Windows：从“此电脑”开始，可进入 `C:`、`D:` 等盘符
  - Linux / macOS：从 `/` 根目录开始，显示 `/mnt`、`/media`、`/Volumes` 等挂载点
- **“向上 / 返回上一级”**
  - 任意目录可返回上一级
  - 在盘符根目录或 `/` 再点一次，回到“此电脑”/根目录列表
- **面包屑导航**
  - 动态展示完整路径，例如：`此电脑 > C: > data > helper > Programming`
  - 每一级均可点击，点击后立即跳转，无逐级动画
- **手动输入模式**
  - 保留原有“手动输入路径”习惯
  - 图形模式与手动模式共享当前路径
  - 可输入完整路径后直接“浏览”或“选择此路径”
- **风险目录视觉提示**
  - 无读取权限目录：灰色 + 删除线 + 🔒，Tooltip 提示“无访问权限，不可选择”，点击被拦截
  - 系统敏感目录：⚠️ 橙色警告图标，Tooltip 提示“系统目录，修改可能影响系统稳定性”
  - “此电脑”与所有可用盘符/根目录始终可访问
- **跨平台**
  - 自动适配 Windows `\` 与 Unix `/` 路径分隔符
  - 自动识别当前操作系统并展示对应的盘符/挂载点

## 安装 / Install

> ⚠️ 当前插件仍在测试阶段。请先在隔离沙盒、模拟环境或 DSH 测试实例中完整验证，再部署到生产环境或公开发布。

### 从本地源码安装（开发 / 测试）

```sh
dsh plugin --profile web add /path/to/dsh-workspace-picker-enhance
```

安装后重启 DSH Web 生效。

### 从 Git 仓库安装（发布后）

```sh
dsh plugin --profile web add github:<你的用户名>/dsh-workspace-picker-enhance
```

### 卸载

```sh
dsh plugin --profile web remove dsh-workspace-picker-enhance
```

卸载并重启后，原生日录选择器界面自动恢复。

## 使用 / Usage

1. 重启 DSH 后打开 WebUI
2. 点击“添加工作区”或“选择工作区”
3. 在弹出的“选择工作区目录”窗口中：
   - 从“此电脑”/根目录开始浏览
   - 点击盘符/挂载点进入
   - 使用顶部“↑”返回上一级
   - 点击面包屑任意层级直接跳转
   - 点击标题栏“手动输入路径”图标，可切换为纯手动输入
4. 选择目标文件夹后点击“选择此文件夹”，完整路径自动回填

## 安全说明 / Security

- 插件仅读取目录结构和权限元数据，不写入、不修改、不删除用户文件
- 无权限目录仅做视觉提示与点击拦截，不会尝试绕过系统权限
- 系统目录仅做警告提示，仍保留“可进入查看”的能力；是否选择由用户自行决定
- Host 路由固定为 `/plugins/workspace-picker-enhance/*`，不占用其它插件命名空间

## 原理 / How it works

| 半 | 文件 | 机制 |
|---|---|---|
| Host 路由 | `lib/index.js` | 注册 `/plugins/workspace-picker-enhance/roots` 与 `/list`，提供盘符/挂载点枚举、权限检测、系统目录标记 |
| 浏览器面板 | `lib/client.js` | 通过 `dsh.client.platform: web` 由 `dsh-client-modules` 扫描发现，注册到 `conversation.hero.workspace.directoryFlow` 与 `sidebar.workspaces.directoryFlow` 插槽，使用 `priority: -1` 覆盖原生日录选择器 |

`cordis.patch.yml` 是 bundle 补丁层：profile 列出本 bundle 时插入一行 `workspace-picker-enhance`。

## 开发 / Development

```
dsh-workspace-picker-enhance/
├── package.json
├── cordis.patch.yml
├── README.md
├── lib/
│   ├── index.js       # Host 半：HTTP 路由 + 文件系统元数据
│   └── client.js      # 浏览器半：增强目录浏览器 UI
└── test/
    └── plugin.test.mjs # 自动测试
```

运行测试：

```sh
npm test
```

## License

MIT
