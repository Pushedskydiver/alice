import type { z } from 'zod/mini';

import type { AgentRegistrySchema, AgentSchema } from '~/schemas/agent.js';

/** A single agent entry derived from the schema. */
export type Agent = z.infer<typeof AgentSchema>;

/** The full registry structure derived from the schema. */
export type AgentRegistry = z.infer<typeof AgentRegistrySchema>;
