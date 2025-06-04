// src/cron.ts
import cron from "node-cron";
import { createScraperManager } from "./scrapers/index.js";
import { logger } from "./utils/logger.js";

export function setupCronJobs() {
	// Run at 9:00 AM on weekdays (1-5 = Monday to Friday)
	cron.schedule(
		"0 9 * * 1-5",
		async () => {
			await runScheduledScrape("9:00 AM");
		},
		{
			timezone: "Europe/Prague",
		},
	);

	// Run at 11:00 AM on weekdays
	cron.schedule(
		"0 11 * * 1-5",
		async () => {
			await runScheduledScrape("11:00 AM");
		},
		{
			timezone: "Europe/Prague",
		},
	);

	logger.info("Cron jobs scheduled for 9:00 AM and 11:00 AM on weekdays");
}

async function runScheduledScrape(time: string) {
	try {
		logger.info(`[Cron] Running scheduled scrape at ${time}`);
		const manager = createScraperManager();
		await manager.runSequentially();
		logger.info(`[Cron] Scheduled scrape at ${time} completed successfully`);
	} catch (error) {
		logger.error(
			`[Cron] Error during scheduled scrape at ${time}: ${JSON.stringify(
				error,
				null,
				2,
			)}`,
			error,
		);
	}
}
