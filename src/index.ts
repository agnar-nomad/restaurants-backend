import "dotenv/config";
import { envConfig } from "@/config/env.js";
import express from "express";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from "@/db/index.js";
import { logger } from "@/utils/logger.js";
import type { ScrapedDataType } from "@/db/schema.js";
import { setupCronJobs } from "./cron.js";
import { createScraperManager } from "./scrapers/index.js";

// Initialize the database connection
const initDb = async () => {
	try {
		await db.read();

		logger.info("Database connection established");
	} catch (error) {
		logger.error("Database connection failed:", error);
		process.exit(1);
	}
};

async function bootstrap() {
	await initDb();

	const app = express();
	app.use(express.json());

	// Health check endpoint
	app.get("/health", (_, res) => {
		res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
	});

	// Get all restaurants with their latest scraped data
    // TODO add some basic Auth
	app.get("/restaurants", async (_, res) => {
		try {   
			await db.read();
            const { restaurants, scrapedData } = db.data;

			// Create a map of restaurant IDs to their latest scraped data
			const latestScrapedData = new Map<number, ScrapedDataType>();
			
			// Sort scraped data by date in descending order and group by restaurantId
			scrapedData
				.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime())
				.forEach(data => {
					if (!latestScrapedData.has(data.restaurantId)) {
						latestScrapedData.set(data.restaurantId, data);
					}
				});

			// Combine restaurants with their latest scraped data
			const restaurantsWithData = restaurants.map(restaurant => ({
				...restaurant,
				latestData: latestScrapedData.get(restaurant.id) || null
			}));

			res.status(200).json(restaurantsWithData);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
            console.log("restaurants fetch error console", message)
			logger.error('Failed to fetch restaurants:', message);
			res.status(500).json({ error: 'Failed to fetch restaurants', details: message });
		}
	});

    // TODO an endpoint that dump the error logs
    // TODO removing old scrapeData entries
    // TODO cron
    // TODO if cron doesnt work, check if data is new enough, otherwise scrape
    app.get("/dump", async (_, res) => {
		try {
			await db.read();

			res.status(200).json(db.data);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
            console.log("dump error console", message)
			logger.error('Failed to fetch dump:', message);
			res.status(500).json({ error: 'Failed to fetch dump', details: message });
		}
	});

    app.get("/manual-scrape", async (_, res) => {
		try {
			const manager = createScraperManager();
            const results = await manager.runSequentially();

            if(results.every(r => r.success)) {
                res.status(200).json({
                    success: true,
                    message: "Manual scrape completed successfully"
                });
            } else {
                const failedScrapers = results.filter(r => !r.success).map(r => r.scraperKey);
                throw new Error(`Manual scrape failed for these scrapers: ${failedScrapers.join(", ")}`);
            }
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			logger.error('Failed to manual scrape:', message);
			res.status(500).json({ error: 'Failed to manual scrape', details: message });
		}
	});

    // Get the directory name in ES module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    app.get("/dump-logs-all", async (_, res) => {
        try {
            const logPath = path.join(__dirname, '../logs/all.log');
            const logContent = await fs.readFile(logPath, 'utf-8');
            
            res.setHeader('Content-Type', 'text/plain');
            res.send(logContent);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to read logs:', message);
            res.status(500).json({ 
                success: false,
                error: 'Failed to read logs',
                details: message 
            });
        }
    })
    app.get("/dump-logs-error", async (_, res) => {
        try {
            const logPath = path.join(__dirname, '../logs/error.log');
            const logContent = await fs.readFile(logPath, 'utf-8');
            
            res.setHeader('Content-Type', 'text/plain');
            res.send(logContent);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to read logs:', message);
            res.status(500).json({ 
                success: false,
                error: 'Failed to read logs',
                details: message 
            });
        }
    })

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

        // Initialize cron jobs
        if (process.env.NODE_ENV === 'production') {
            setupCronJobs();
        }
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
