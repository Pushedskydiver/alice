// Alice update checker — runs on SessionStart
// Best-effort: never throws, never blocks

const { execFileSync } = require('child_process');
const { readFileSync } = require('fs');
const { resolve } = require('path');

try {
  const pkgPath = resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const current = pkg.version;

  const latest = execFileSync('npm', ['view', 'alice-agents', 'version'], {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();

  if (latest && latest !== current) {
    console.log(
      `\x1b[31m🔄 Alice v${current} → v${latest} available. Run /alice:update\x1b[0m`,
    );
  }
} catch (_) {
  // Best-effort — silently ignore errors
}
