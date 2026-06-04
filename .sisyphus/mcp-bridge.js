#!/usr/bin/env node
/**
 * MCP stdio-to-HTTP bridge untuk Supabase Studio.
 * Setiap request pake koneksi HTTP baru (no keep-alive)
 * karena Studio punya masalah dengan connection reuse.
 */
const MCP_URL = 'http://localhost:8000/mcp';

import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });

for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  try {
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Connection': 'close',
      },
      body: trimmed,
      keepalive: false,
    });

    if (!response.ok) {
      const text = await response.text();
      process.stderr.write(`[bridge] HTTP ${response.status}: ${text}\n`);
      const req = JSON.parse(trimmed);
      if (req.id != null) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: req.id,
          error: { code: -32000, message: `Upstream error: ${response.status}` },
        }) + '\n');
      }
      continue;
    }

    const text = await response.text();
    if (text) {
      process.stdout.write(text + '\n');
    }
  } catch (err) {
    process.stderr.write(`[bridge] Error: ${err.message}\n`);
    try {
      const req = JSON.parse(trimmed);
      if (req.id != null) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: req.id,
          error: { code: -32603, message: `Bridge error: ${err.message}` },
        }) + '\n');
      }
    } catch { /* silent */ }
  }
}
