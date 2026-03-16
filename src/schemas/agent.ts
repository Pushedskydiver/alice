import { z } from 'zod/mini';

/**
 * Schema for a single agent entry in the registry.
 *
 * Required fields: `id`, `name`, `description`, `author`, `url`,
 * `npm_package`, `install_cmd`, `supports_existing_project`,
 * `supports_greenfield`.
 *
 * Optional fields cover board support, roles, runtimes, slash commands,
 * and extended metadata (tags, versioning, OS support, lifecycle).
 */
export const AgentSchema = z.object({
  // --- Required fields ---
  id: z.string().check(z.regex(/^[a-z0-9_-]+$/)),
  name: z.string().check(z.minLength(1)),
  description: z.string().check(z.minLength(10)),
  author: z.string().check(z.minLength(1)),
  url: z.string().check(z.url()),
  npm_package: z.string().check(z.minLength(1)),
  install_cmd: z.string().check(z.minLength(1)),
  requires_board: z.boolean(),
  supports_existing_project: z.boolean(),
  supports_greenfield: z.boolean(),

  // --- Optional fields ---
  supported_boards: z.optional(z.array(z.string())),
  has_roles: z.optional(z.boolean()),
  optional_roles: z.optional(z.array(z.string())),
  multi_runtime: z.optional(z.array(z.string())),
  init_slash: z.optional(z.string()),
  new_project_slash: z.optional(z.string()),
  map_codebase_slash: z.optional(z.string()),

  // --- Extended metadata ---
  tags: z.optional(z.array(z.string())),
  min_node_version: z.optional(z.string()),
  os_support: z.optional(z.array(z.string())),
  deprecated: z.optional(z.boolean()),
  experimental: z.optional(z.boolean()),
});

/**
 * Schema for the full registry file (`registry/agents.json`).
 */
export const AgentRegistrySchema = z.object({
  agents: z.array(AgentSchema),
});
