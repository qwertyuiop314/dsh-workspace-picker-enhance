# dsh-workspace-picker-enhance

> **Enhanced Workspace Directory Picker for DeepSeek Harness**
> 为 DSH“选择工作区”面板增加跨盘符/挂载点浏览、面包屑一键跳转、手动输入模式，以及无权限/系统目录视觉提示。
>
> An enhanced workspace directory picker for DeepSeek Harness: cross-drive / mount-point browsing, clickable breadcrumbs, manual path mode, and visual indicators for inaccessible and system-sensitive directories.

为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的“选择工作区”目录选择器提供增强能力。它通过 DSH 官方 UI 插槽注入，不修改 DSH 核心代码，也不修改原生日录选择器源码；卸载后原界面可完全恢复。

This plugin enhances the DSH "Select Workspace" directory picker through the official DSH UI slot system. It does not modify DSH core code or the original directory-picker source, and the original UI is fully restored after uninstall.

---

## 功能 / Features

### 中文

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

### English

- **Cross-drive / mount-point browsing**
  - Windows: start from "This PC" and enter drives such as `C:`, `D:`
  - Linux / macOS: start from `/` and see mount points such as `/mnt`, `/media`, `/Volumes`
- **Up one level**
  - Go up from any directory
  - From a drive root or `/`, go back to "This PC" / the root list
- **Clickable breadcrumbs**
  - Shows the full path dynamically, e.g. `This PC > C: > data > helper > Programming`
  - Every level is clickable and jumps immediately
- **Manual path mode**
  - Keeps the original "type a path" workflow
  - Graphical mode and manual mode share the same current path
  - Supports "Browse" or "Use this path" after typing a full path
- **Risk directory indicators**
  - Inaccessible directories: grey + strikethrough + 🔒, tooltip "No access, cannot select", click is blocked
  - System-sensitive directories: ⚠️ orange warning icon, tooltip "System directory, changes may affect system stability"
  - "This PC" and all available drive/mount roots remain accessible
- **Cross-platform**
  - Automatically uses Windows `\` or Unix `/` separators
  - Automatically detects the OS and shows the matching drives / mount points

---

## 安装 / Install

> ⚠️ 当前插件仍在测试阶段。请先在隔离沙盒、模拟环境或 DSH 测试实例中完整验证，再部署到生产环境或公开发布。
>
> ⚠️ This plugin is still in testing. Please validate it in an isolated sandbox, simulation environment, or a DSH test instance before deploying to production or publishing.

### 从本地源码安装 / Install from local source

```sh
dsh plugin --profile web add /path/to/dsh-workspace-picker-enhance
```

安装后重启 DSH Web 生效。  
Restart DSH Web after installation.

### 从 Git 仓库安装（发布后）/ Install from Git (after publishing)

```sh
dsh plugin --profile web add github:<your-username>/dsh-workspace-picker-enhance
```

### 卸载 / Uninstall

```sh
dsh plugin --profile web remove dsh-workspace-picker-enhance
```

卸载并重启后，原生日录选择器界面自动恢复。  
The original directory picker UI is restored after uninstall and restart.

---

## 使用 / Usage

### 中文

1. 重启 DSH 后打开 WebUI
2. 点击“添加工作区”或“选择工作区”
3. 在弹出的“选择工作区目录”窗口中：
   - 从“此电脑”/根目录开始浏览
   - 点击盘符/挂载点进入
   - 使用顶部“↑”返回上一级
   - 点击面包屑任意层级直接跳转
   - 点击标题栏“手动输入路径”图标，可切换为纯手动输入
4. 选择目标文件夹后点击“选择此文件夹”，完整路径自动回填

### English

1. Restart DSH and open the WebUI
2. Click "Add Workspace" or "Select Workspace"
3. In the "Select Workspace Directory" dialog:
   - Start from "This PC" / the root directory
   - Click a drive or mount point to enter it
   - Use the "↑" button to go up one level
   - Click any breadcrumb level to jump directly
   - Click the "Enter path manually" icon in the title bar to switch to manual input
4. Select a folder and click "Select this folder"; the full path is filled in automatically

---

## 安全说明 / Security

### 中文

- 插件仅读取目录结构和权限元数据，不写入、不修改、不删除用户文件
- 无权限目录仅做视觉提示与点击拦截，不会尝试绕过系统权限
- 系统目录仅做警告提示，仍保留“可进入查看”的能力；是否选择由用户自行决定
- Host 路由固定为 `/plugins/workspace-picker-enhance/*`，不占用其它插件命名空间
- 文件枚举接口带有基本的同源/回环地址校验；请勿将 DSH Web 暴露到不可信网络或公网，若必须暴露，请在反向代理层增加鉴权

### English

- The plugin only reads directory structure and permission metadata; it does not write, modify, or delete user files
- Inaccessible directories are only visually marked and click-blocked; the plugin never tries to bypass OS permissions
- System directories are only warnings; users can still enter and inspect them, and decide whether to select them
- Host routes are namespaced under `/plugins/workspace-picker-enhance/*` and do not conflict with other plugins
- The file-enumeration endpoints include a basic loopback / same-origin check; do not expose DSH Web to untrusted networks or the public internet. If exposure is required, add authentication at a reverse proxy layer.

---

## 原理 / How it works

| Part | File | Mechanism |
|---|---|---|
| Host routes | `lib/index.js` | Registers `/plugins/workspace-picker-enhance/roots` and `/list`; provides drive/mount enumeration, permission checks, and system-directory flags |
| Browser UI | `lib/client.js` | Discovered by `dsh-client-modules` via `dsh.client.platform: web`; registers to `conversation.hero.workspace.directoryFlow` and `sidebar.workspaces.directoryFlow` with `priority: -1` to shadow the original picker |

`cordis.patch.yml` is the bundle patch layer: it inserts the `workspace-picker-enhance` row when the bundle is listed in the profile.

---

## 已知限制 / Known limitations

### 中文

- 超大目录（如 `/usr`）单次最多返回 1000 条，超出部分会标记 `truncated: true`，不会自动分页
- Windows 下 `fs.access` 对目录权限的判断是尽力而为，🔒 无权限提示可能不如 POSIX 精确
- 隐藏目录会显示但视觉弱化（半透明），方便选择 `.config` 这类目录
- 符号链接指向自身或祖先目录时会被标记为“目录循环”并阻止进入，避免无限深入

### English

- Very large directories (e.g. `/usr`) return at most 1000 entries per request; extra entries are marked `truncated: true` and are not paginated yet
- On Windows, directory permission detection via `fs.access` is best-effort; the 🔒 indicator may be less precise than on POSIX
- Hidden directories are shown but visually dimmed, so folders like `.config` remain selectable
- Symlinks pointing to themselves or an ancestor are marked as a directory loop and blocked, preventing infinite navigation

---

## 开发 / Development

```
dsh-workspace-picker-enhance/
├── package.json
├── cordis.patch.yml
├── README.md
├── lib/
│   ├── index.js       # Host: HTTP routes + filesystem metadata
│   └── client.js      # Browser: enhanced directory browser UI
└── test/
    └── plugin.test.mjs # Automated tests
```

运行测试 / Run tests:

```sh
npm test
```

---

## License

MIT
