import { envConfig } from "@/config/env.js";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const db = drizzle(envConfig.DATABASE_URL, {
	schema,
});

export { db };
