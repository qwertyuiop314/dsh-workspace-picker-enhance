import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { apply } from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function makeCtx() {
  const routes = new Map()
  const ctx = {
    get(key) {
      if (key === 'webServer') {
        return {
          register({ path, handler }) {
            routes.set(path, handler)
          },
        }
      }
      return undefined
    },
    effect(fn) {
      fn()
      return () => {}
    },
  }
  apply(ctx)
  return routes
}

async function callRoute(routes, pathname, query) {
  const handler = routes.get(pathname)
  assert.ok(handler, `route ${pathname} should be registered`)
  let status
  let body
  const req = {
    url: pathname + (query ? '?' + new URLSearchParams(query) : ''),
    socket: { remoteAddress: '127.0.0.1' },
  }
  const res = {
    writeHead(code) { status = code },
    end(text) { body = JSON.parse(text) },
  }
  await handler(req, res)
  return { status, body }
}

test('host routes are registered', () => {
  const routes = makeCtx()
  assert.ok(routes.has('/plugins/workspace-picker-enhance/roots'))
  assert.ok(routes.has('/plugins/workspace-picker-enhance/list'))
})

test('roots returns platform, separator and at least the POSIX root on linux/darwin', async () => {
  const routes = makeCtx()
  const { status, body } = await callRoute(routes, '/plugins/workspace-picker-enhance/roots')
  assert.equal(status, 200)
  assert.equal(typeof body.platform, 'string')
  assert.ok(body.separator === '/' || body.separator === '\\')
  assert.ok(Array.isArray(body.roots))
  assert.ok(body.roots.length > 0)
  if (body.platform !== 'win32') {
    assert.ok(body.roots.some((r) => r.path === '/'))
  }
})

test('list returns directory metadata with permission and system flags', async () => {
  const routes = makeCtx()
  const { status, body } = await callRoute(routes, '/plugins/workspace-picker-enhance/list', { path: '/' })
  assert.equal(status, 200)
  assert.equal(body.path, '/')
  assert.ok(Array.isArray(body.crumbs))
  assert.ok(Array.isArray(body.entries))
  for (const entry of body.entries) {
    assert.equal(entry.type, 'directory')
    assert.equal(typeof entry.readable, 'boolean')
    assert.equal(typeof entry.system, 'boolean')
    assert.equal(typeof entry.hidden, 'boolean')
    assert.equal(typeof entry.loop, 'boolean')
  }
  const etc = body.entries.find((e) => e.name === 'etc')
  if (etc) {
    assert.equal(etc.system, true)
  }
})

test('list returns 404 for a missing path', async () => {
  const routes = makeCtx()
  const { status, body } = await callRoute(routes, '/plugins/workspace-picker-enhance/list', { path: '/definitely-not-a-real-dsh-test-path-12345' })
  assert.equal(status, 404)
  assert.ok(body.error)
})

test('routes reject non-loopback requests without same-origin header', async () => {
  const routes = makeCtx()
  const handler = routes.get('/plugins/workspace-picker-enhance/roots')
  let status
  let body
  const req = {
    url: '/plugins/workspace-picker-enhance/roots',
    socket: { remoteAddress: '192.168.1.20' },
    headers: {},
  }
  const res = {
    writeHead(code) { status = code },
    end(text) { body = JSON.parse(text) },
  }
  await handler(req, res)
  assert.equal(status, 403)
  assert.equal(body.error, 'forbidden')
})

test('client file exists and contains required registration points', () => {
  const clientPath = path.join(rootDir, 'lib/client.js')
  assert.ok(existsSync(clientPath))
  const source = readFileSync(clientPath, 'utf8')
  assert.match(source, /conversation\.hero\.workspace\.directoryFlow/)
  assert.match(source, /sidebar\.workspaces\.directoryFlow/)
  assert.match(source, /priority:\s*-1/)
  assert.match(source, /无法访问此文件夹/)
  assert.match(source, /系统目录，修改可能影响系统稳定性/)
})

test('package metadata is complete for a DSH bundle plugin', () => {
  const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
  assert.equal(pkg.name, 'dsh-workspace-picker-enhance')
  assert.ok(pkg.main)
  assert.ok(pkg.exports['./client'])
  assert.ok(pkg.dsh.bundle.patch)
  assert.ok(pkg.dsh.client.platform === 'web')
  assert.ok(existsSync(path.join(rootDir, 'cordis.patch.yml')))
})
