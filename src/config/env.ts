import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("3006"),
	DATABASE_URL: z.string().min(1, "Database URL is required"),
	LOG_LEVEL: z
		.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
		.default("info"),
});

type EnvSchema = z.infer<typeof envSchema>;

// Extend NodeJS.ProcessEnv with our custom env variables
declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvSchema {}
	}
}

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
	throw new Error(
		`Invalid environment variables: ${JSON.stringify(env.error.format(), null, 2)}`,
	);
}

export const envConfig = env.data;

export type Env = typeof envConfig;
