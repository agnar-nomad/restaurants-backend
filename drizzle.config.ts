import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { envConfig } from "./src/config/env";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: envConfig.DATABASE_URL,
	},
});
