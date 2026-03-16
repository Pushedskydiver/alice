import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AgentRegistry } from '~/types/agent.js';
import { AgentRegistrySchema } from '~/schemas/agent.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Resolves the absolute path to `registry/agents.json` relative to the
 * package root.
 *
 * @returns Absolute path to the registry file.
 */
export const getRegistryPath = (): string =>
  join(resolve(__dirname, '..', '..', '..'), 'registry', 'agents.json');

/**
 * Loads and validates `registry/agents.json` against the zod schema.
 * Throws a `ZodError` if validation fails.
 *
 * @param path - Optional override path for testing.
 * @returns The validated registry object.
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * console.log(registry.agents[0].name); // "Clancy"
 * ```
 */
export const loadRegistry = (path?: string): AgentRegistry => {
  const filePath = path ?? getRegistryPath();
  const raw = readFileSync(filePath, 'utf-8');
  const data: unknown = JSON.parse(raw);

  return AgentRegistrySchema.parse(data);
};
