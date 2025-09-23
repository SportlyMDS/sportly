import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../db/schema'

export { sql, eq, and, or } from 'drizzle-orm'

export function useDrizzle() {
  return drizzle({
    connection: {
      connectionString: useRuntimeConfig().databaseUrl
    },
    schema
  })
}

export const tables = schema

export type User = typeof schema.users.$inferSelect
