import { db } from "@/db/index.js";
import { restaurantsTable, scrapedDataTable } from "@/db/schema.js";
import { logger } from "@/utils/logger.js";
import { eq } from "drizzle-orm";
import type { Scraper, ScraperResult } from "./types.js";

export class ScraperManager {
	private scrapers: Scraper[] = [];

	register(scraper: Scraper) {
		this.scrapers.push(scraper);
		return this;
	}

	async runSequentially() {
		const results: ScraperResult[] = [];

		for (const scraper of this.scrapers) {
			logger.info(`[ScraperManager] Running ${scraper.name}...`);
			const result = await scraper.scrape();
			results.push(result);
			await this.saveResult(result);
		}

		return results;
	}

	async runConcurrently() {
		logger.info(
			`[ScraperManager] Running ${this.scrapers.length} scrapers concurrently...`,
		);
		const results = await Promise.all(
			this.scrapers.map(async (scraper) => {
				logger.info(`[ScraperManager] Starting ${scraper.name}...`);
				const result = await scraper.scrape();
				await this.saveResult(result);
				return result;
			}),
		);

		return results;
	}

	private async saveResult(result: ScraperResult) {
		if (!result.success || !result.data || result.data.length === 0) {
			logger.warn(
				`[ScraperManager] Not saving failed scrape for ${result.scraperName}`,
			);
			return;
		}

		try {
            logger.info("Saving result:", result);
            const restaurant = await db.query.restaurantsTable.findFirst({
                where: eq(restaurantsTable.name, result.scraperName),
			});

			if (restaurant) {
				await db.insert(scrapedDataTable).values({
				  restaurantId: restaurant.id,
				  content: result.data,
				  scrapedAt: new Date()
				});

				logger.info(
					`[ScraperManager] Saved ${result.data.length} items from ${result.scraperName}`,
				);
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error(
					`[ScraperManager] Error saving ${result.scraperName} data:`,
					error.message,
				);
			} else {
				logger.error(
					`[ScraperManager] Unknown error saving ${result.scraperName} data`,
				);
			}
		}
	}
}
