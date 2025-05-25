import { envConfig } from "@/config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const pool = new Pool({
	connectionString: envConfig.DATABASE_URL,
	ssl:
		envConfig.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db_old = drizzle(pool, { schema });

export type Database = typeof db_old;
