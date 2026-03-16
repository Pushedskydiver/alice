// Alice update checker — runs on SessionStart
// Best-effort: never throws, never blocks

const { execFileSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { homedir } = require('os');

try {
  // Skip in CI or when explicitly disabled
  if (process.env.CI || process.env.ALICE_NO_UPDATE_CHECK) {
    process.exit(0);
  }

  // Skip in non-interactive environments
  if (!process.stdout.isTTY) {
    process.exit(0);
  }

  const pkgPath = resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const current = pkg.version;

  const cachePath = resolve(homedir(), '.alice-update-cache.json');
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  let latest = null;

  // Try reading cache
  if (existsSync(cachePath)) {
    try {
      const cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
      if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL_MS) {
        latest = cache.latest;
      }
    } catch (_) {
      // Corrupted cache — will re-fetch
    }
  }

  // Fetch from npm if cache is stale or missing
  if (!latest) {
    latest = execFileSync('npm', ['view', 'alice-agents', 'version'], {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    // Write cache
    try {
      writeFileSync(
        cachePath,
        JSON.stringify({ latest: latest, timestamp: Date.now() }),
      );
    } catch (_) {
      // Best-effort cache write
    }
  }

  if (latest && latest !== current) {
    console.log(
      `\x1b[31m\u{1F504} Alice v${current} \u2192 v${latest} available. Run /alice:update\x1b[0m`,
    );
  }
} catch (_) {
  // Best-effort — silently ignore errors
}
