#!/usr/bin/env node

/**
 * Standalone validation script for `registry/agents.json`.
 * Run via `npm run validate:registry`.
 *
 * Exits with code 0 on success, 1 on validation failure.
 */

import { loadRegistry } from './registry.js';

try {
  const registry = loadRegistry();
  const count = registry.agents.length;
  const ids = registry.agents.map((a) => a.id).join(', ');
  console.log(`✓ Registry valid — ${count} agent(s): ${ids}`);
} catch (err: unknown) {
  console.error('✗ Registry validation failed:\n');
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(String(err));
  }
  process.exit(1);
}
