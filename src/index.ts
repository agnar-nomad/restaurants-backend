import "dotenv/config";
import { envConfig } from "@/config/env.js";
// Database import is kept for future use
import { db } from "@/db/index.js";
import { logger } from "@/utils/logger.js";
import express from "express";

// Initialize the database connection
const initDb = async () => {
	try {
		await db.select();
		logger.info("Database connection established");
	} catch (error) {
		logger.error("Database connection failed:", error);
		process.exit(1);
	}
};

async function bootstrap() {
	// Initialize database connection
	await initDb();

	const app = express();

	// Middleware
	app.use(express.json());

	// Health check endpoint
	app.get("/health", (_, res) => {
		res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
	});

	// 404 handler
	app.use((_req, res) => {
		res.status(404).json({ error: "Not Found" });
	});

	// Error handler
	app.use((err: Error, req: express.Request, res: express.Response) => {
		logger.error(`[${req.method}] ${req.path} - ${err.message}`);
		res.status(500).json({ error: "Internal Server Error" });
	});

	// Start server
	const server = app.listen(envConfig.PORT, () => {
		logger.info(`🚀 Server running on http://localhost:${envConfig.PORT}`);
	});

	// Handle shutdown
	const shutdown = async () => {
		logger.info("Shutting down server...");
		await new Promise<void>((resolve) => {
			server.close(() => {
				logger.info("Server closed");
				resolve();
			});
		});
		process.exit(0);
	};

	process.on("SIGTERM", shutdown);
	process.on("SIGINT", shutdown);
}

bootstrap().catch((error) => {
	logger.error("Failed to start server:", error);
	process.exit(1);
});
