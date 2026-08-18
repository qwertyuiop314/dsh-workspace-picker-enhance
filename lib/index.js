/**
 * dsh-workspace-picker-enhance — host half.
 *
 * Adds HTTP routes used by the enhanced workspace directory browser:
 *   GET /plugins/workspace-picker-enhance/roots
 *   GET /plugins/workspace-picker-enhance/list?path=...
 *
 * The routes are served by the same web server as the DSH GUI, so the browser
 * client can fetch them from the page origin. They provide cross-drive/root
 * enumeration plus per-directory permission and system-directory metadata.
 */
import { promises as fs, constants } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

export const name = 'workspace-picker-enhance'
export const inject = []

const SENSITIVE = {
  win32: [
    'Windows', 'System32', 'SysWOW64', 'Program Files', 'Program Files (x86)',
    'ProgramData', 'PerfLogs', 'Recovery', '$Recycle.Bin',
    'System Volume Information', 'Config.Msi'
  ],
  linux: [
    'etc', 'boot', 'sys', 'proc', 'dev', 'root', 'lost+found', 'sbin', 'bin',
    'lib', 'lib64', 'usr', 'var', 'run', 'tmp'
  ],
  darwin: [
    'System', 'etc', 'boot', 'sbin', 'bin', 'usr', 'var', 'private',
    'cores'
  ]
}

function isSystemEntry(name, platform) {
  const list = SENSITIVE[platform] || SENSITIVE.linux
  return list.includes(name)
}

function send(res, status, obj) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(obj))
}

function param(req, key) {
  try {
    return new URL(req.url ?? '/', 'http://x').searchParams.get(key)
  } catch {
    return null
  }
}

async function isReadable(target, platform) {
  try {
    if (platform === 'win32') {
      await fs.access(target, constants.R_OK)
    } else {
      await fs.access(target, constants.R_OK | constants.X_OK)
    }
    return true
  } catch {
    return false
  }
}

function buildCrumbs(target, platform) {
  const crumbs = []
  let current = target
  for (;;) {
    const parent = path.dirname(current)
    const name = parent === current
      ? (platform === 'win32' ? current.replace(/[\\/]+$/, '') || current : current)
      : path.basename(current)
    crumbs.unshift({ name, path: current, kind: 'dir' })
    if (parent === current) break
    current = parent
  }
  return crumbs
}

async function readDirectory(targetPath, platform) {
  const target = path.resolve(targetPath)
  const info = await fs.stat(target)
  if (!info.isDirectory()) {
    const err = new Error('not-a-directory')
    err.status = 404
    throw err
  }

  const dirents = await fs.readdir(target, { withFileTypes: true })
  const entries = []

  for (const dirent of dirents) {
    let isDir = dirent.isDirectory()
    if (!isDir && dirent.isSymbolicLink()) {
      try {
        isDir = (await fs.stat(path.join(target, dirent.name))).isDirectory()
      } catch {
        isDir = false
      }
    }
    if (!isDir) continue

    const full = path.join(target, dirent.name)
    const readable = await isReadable(full, platform)
    entries.push({
      name: dirent.name,
      path: full,
      type: 'directory',
      hidden: dirent.name.startsWith('.'),
      readable,
      system: isSystemEntry(dirent.name, platform),
    })
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))

  return {
    path: target,
    sep: platform === 'win32' ? '\\' : '/',
    home: homedir(),
    platform,
    crumbs: buildCrumbs(target, platform),
    entries,
    truncated: false,
  }
}

async function listRoots(platform) {
  const home = homedir()
  const roots = []

  if (platform === 'win32') {
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i)
      const root = `${letter}:\\`
      try {
        await fs.access(root)
        roots.push({
          name: `${letter}:`,
          path: root,
          kind: 'drive',
          readable: true,
          system: false,
        })
      } catch {
        // skip unavailable drives
      }
    }
  } else {
    roots.push({
      name: '/',
      path: '/',
      kind: 'root',
      readable: true,
      system: false,
    })
    const mountPoints = platform === 'darwin' ? ['/Volumes'] : ['/mnt', '/media']
    for (const mount of mountPoints) {
      try {
        const st = await fs.stat(mount)
        if (st.isDirectory()) {
          roots.push({
            name: mount,
            path: mount,
            kind: 'mount',
            readable: await isReadable(mount, platform),
            system: false,
          })
        }
      } catch {
        // optional mount directories may not exist
      }
    }
  }

  return {
    platform,
    separator: platform === 'win32' ? '\\' : '/',
    home,
    roots,
  }
}

export function apply(ctx) {
  const platform = process.platform
  const message = (err) => String((err && err.message) || err)

  let registered = false
  const registerWeb = () => {
    if (registered) return
    const webServer = ctx.get('webServer') ?? ctx.get('httpServer')
    if (webServer === undefined) return
    registered = true

    const route = (pathname, handler) => {
      ctx.effect(() => webServer.register({ kind: 'exact', path: pathname, handler }), 'workspace-picker-enhance: ' + pathname)
    }

    route('/plugins/workspace-picker-enhance/roots', async (req, res) => {
      try {
        send(res, 200, await listRoots(platform))
      } catch (err) {
        send(res, 500, { error: message(err) })
      }
    })

    route('/plugins/workspace-picker-enhance/list', async (req, res) => {
      const target = param(req, 'path')
      if (!target) {
        send(res, 400, { error: 'missing path' })
        return
      }
      try {
        send(res, 200, await readDirectory(target, platform))
      } catch (err) {
        const status = err.status || 500
        send(res, status, { error: message(err) })
      }
    })
  }

  // Some host versions expose the web server only after startup; retry on the
  // next tick if it is not available yet.
  if (ctx.get('webServer') ?? ctx.get('httpServer')) {
    registerWeb()
  } else {
    ctx.effect(() => {
      const timer = setInterval(() => {
        if (ctx.get('webServer') ?? ctx.get('httpServer')) {
          clearInterval(timer)
          registerWeb()
        }
      }, 250)
      return () => clearInterval(timer)
    }, 'workspace-picker-enhance: wait for web server')
  }
}
