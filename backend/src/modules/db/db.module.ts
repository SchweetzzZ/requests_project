import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE, type DrizzleDB } from './db.constants';
import * as schema from './schema';

export * from './db.constants';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (): DrizzleDB => {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
          throw new Error('DATABASE_URL not found');
        }
        const pool = new Pool({
          connectionString: DATABASE_URL,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
