# dsh-workspace-picker-enhance

> **Enhanced Workspace Directory Picker for DeepSeek Harness**
> Cross-drive / mount-point browsing, clickable breadcrumbs, manual path mode, and visual indicators for inaccessible and system-sensitive directories.

An enhanced workspace directory picker for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). It is injected through the official DSH UI slot system, does not modify DSH core code or the original directory-picker source, and the original UI is fully restored after uninstall.

## Features

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

## Install

> ⚠️ This plugin is still in testing. Please validate it in an isolated sandbox, simulation environment, or a DSH test instance before deploying to production or publishing.

### Install from local source

```sh
dsh plugin --profile web add /path/to/dsh-workspace-picker-enhance
```

Restart DSH Web after installation.

### Install from Git (after publishing)

```sh
dsh plugin --profile web add github:<your-username>/dsh-workspace-picker-enhance
```

### Uninstall

```sh
dsh plugin --profile web remove dsh-workspace-picker-enhance
```

The original directory picker UI is restored after uninstall and restart.

## Usage

1. Restart DSH and open the WebUI
2. Click "Add Workspace" or "Select Workspace"
3. In the "Select Workspace Directory" dialog:
   - Start from "This PC" / the root directory
   - Click a drive or mount point to enter it
   - Use the "↑" button to go up one level
   - Click any breadcrumb level to jump directly
   - Click the "Enter path manually" icon in the title bar to switch to manual input
4. Select a folder and click "Select this folder"; the full path is filled in automatically

## Security

- The plugin only reads directory structure and permission metadata; it does not write, modify, or delete user files
- Inaccessible directories are only visually marked and click-blocked; the plugin never tries to bypass OS permissions
- System directories are only warnings; users can still enter and inspect them, and decide whether to select them
- Host routes are namespaced under `/plugins/workspace-picker-enhance/*` and do not conflict with other plugins

## How it works

| Part | File | Mechanism |
|---|---|---|
| Host routes | `lib/index.js` | Registers `/plugins/workspace-picker-enhance/roots` and `/list`; provides drive/mount enumeration, permission checks, and system-directory flags |
| Browser UI | `lib/client.js` | Discovered by `dsh-client-modules` via `dsh.client.platform: web`; registers to `conversation.hero.workspace.directoryFlow` and `sidebar.workspaces.directoryFlow` with `priority: -1` to shadow the original picker |

`cordis.patch.yml` is the bundle patch layer: it inserts the `workspace-picker-enhance` row when the bundle is listed in the profile.

## Development

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

Run tests:

```sh
npm test
```

## License

MIT
