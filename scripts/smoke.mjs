#!/usr/bin/env node
// HTTP smoke checks for the built PWA. Without SMOKE_URL, starts vite preview locally.
// The smoke test deliberately avoids protected/provider API calls.
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const port = 4173;
const root = process.cwd();
const remote = process.env.SMOKE_URL?.trim();
const base = remote ? new URL(remote) : new URL(`http://127.0.0.1:${port}`);
let server;
if (!remote) {
  server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
}
async function get(path, expectedType) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(new URL(path, base), { redirect: 'error', signal: controller.signal });
    if (res.status !== 200) throw new Error(`${path}: HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes(expectedType)) throw new Error(`${path}: unexpected Content-Type ${type}`);
    return { response: res, body: await res.text() };
  } finally {
    clearTimeout(timeout);
  }
}
async function main() {
  if (!remote) {
    let available = false;
    for (let i = 0; i < 40; i++) {
      if (server.exitCode !== null) throw new Error('Vite preview exited before becoming ready');
      try { const r = await fetch(base); if (r.ok) { available = true; break; } } catch { /* starting */ }
      await delay(250);
    }
    if (!available) throw new Error('Vite preview did not become ready');
  }
  for (const path of ['/', '/calendar', '/rates', '/settings', '/channels']) {
    const { body } = await get(path, 'text/html');
    if (!body.includes('lang="cs"') || !body.includes('/assets/')) throw new Error(`${path}: Czech SPA shell or assets missing`);
    console.log('PASS', path, 'HTML + Czech SPA');
  }
  const { body: manifestText } = await get('/manifest.webmanifest', 'application/manifest');
  const manifest = JSON.parse(manifestText);
  if (manifest.theme_color?.toLowerCase() !== '#040c09' || manifest.lang !== 'cs' || manifest.display !== 'standalone') {
    throw new Error('PWA manifest theme/language/display invalid');
  }
  console.log('PASS manifest: Czech, emerald, standalone');
  for (const icon of ['/pwa-192x192.png', '/pwa-512x512.png']) {
    const { response } = await get(icon, 'image/png');
    if (Number(response.headers.get('content-length') || 0) < 1000) throw new Error(`${icon}: suspiciously small`);
    console.log('PASS', icon);
  }
  await get('/sw.js', 'javascript');
  console.log('PASS service worker');
  if (remote) {
    const response = await fetch(base, { method: 'HEAD' });
    for (const [header, expected] of [['x-content-type-options','nosniff'],['x-frame-options','DENY'],['referrer-policy','strict-origin-when-cross-origin']]) {
      if (response.headers.get(header)?.toLowerCase() !== expected.toLowerCase()) throw new Error(`Missing security header: ${header}`);
    }
    console.log('PASS production security headers');
  }
}
try {
  await main();
} catch (err) {
  console.error('FAIL', err.message);
  process.exitCode = 1;
} finally {
  server?.kill('SIGTERM');
}
