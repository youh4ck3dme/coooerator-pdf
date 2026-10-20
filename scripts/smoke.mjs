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
      if (server.exitCode !== null) throw new Error('Vite preview e¶»§q«^