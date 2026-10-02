import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';
export type DrizzleDB = NodePgDatabase<typeof schema>;
