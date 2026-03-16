import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadRegistry } from './registry.js';

let tmp: string;

beforeEach(() => {
  tmp = join(tmpdir(), `alice-registry-test-${crypto.randomUUID()}`);
  mkdirSync(tmp, { recursive: true });
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

const validRegistry = {
  agents: [
    {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'A test agent for validation purposes',
      author: 'Test Author',
      url: 'https://example.com',
      npm_package: 'test-agent',
      install_cmd: 'npx test-agent',
      requires_board: false,
      supports_existing_project: true,
      supports_greenfield: true,
    },
  ],
};

describe('loadRegistry', () => {
  it('loads and validates a valid registry file', () => {
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify(validRegistry));

    const result = loadRegistry(filePath);

    expect(result.agents).toHaveLength(1);
    expect(result.agents[0].id).toBe('test-agent');
  });

  it('loads the real registry/agents.json successfully', () => {
    const result = loadRegistry();

    expect(result.agents.length).toBeGreaterThanOrEqual(3);
    expect(result.agents.map((a) => a.id)).toContain('clancy');
  });

  it('accepts optional extended metadata fields', () => {
    const registry = {
      agents: [
        {
          ...validRegistry.agents[0],
          tags: ['fast', 'parallel'],
          min_node_version: '>=22.0.0',
          os_support: ['macos', 'linux', 'windows'],
          deprecated: false,
          experimental: true,
        },
      ],
    };
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify(registry));

    const result = loadRegistry(filePath);

    expect(result.agents[0].tags).toEqual(['fast', 'parallel']);
    expect(result.agents[0].os_support).toEqual([
      'macos',
      'linux',
      'windows',
    ]);
    expect(result.agents[0].experimental).toBe(true);
  });

  it('throws on missing required field (author)', () => {
    const { author: _author, ...noAuthor } = validRegistry.agents[0];
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify({ agents: [noAuthor] }));

    expect(() => loadRegistry(filePath)).toThrow();
  });

  it('throws on invalid id format (uppercase)', () => {
    const registry = {
      agents: [{ ...validRegistry.agents[0], id: 'INVALID' }],
    };
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify(registry));

    expect(() => loadRegistry(filePath)).toThrow();
  });

  it('throws on invalid url format', () => {
    const registry = {
      agents: [{ ...validRegistry.agents[0], url: 'not-a-url' }],
    };
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify(registry));

    expect(() => loadRegistry(filePath)).toThrow();
  });

  it('throws on description shorter than 10 characters', () => {
    const registry = {
      agents: [{ ...validRegistry.agents[0], description: 'Short' }],
    };
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, JSON.stringify(registry));

    expect(() => loadRegistry(filePath)).toThrow();
  });

  it('throws on malformed JSON', () => {
    const filePath = join(tmp, 'agents.json');
    writeFileSync(filePath, '{ invalid json }');

    expect(() => loadRegistry(filePath)).toThrow();
  });
});
