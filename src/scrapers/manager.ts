import { db } from "@/db/index.js";
import { logger } from "@/utils/logger.js";
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

			const saveSuccess = await this.saveResult(result);
			if (saveSuccess) {
				results.push(result);
			} else {
				results.push({
					error: "Failed to save result",
					scraperKey: result.scraperKey,
					success: false,
					duration: result.duration,
				});
			}
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
				`[ScraperManager] Not saving failed scrape for ${result.scraperKey}`,
			);
			return false;
		}

		try {
			logger.info(
				`Saving result: ${result.scraperKey}; success: ${String(
					result.success,
				)}, took: ${result.duration}ms`,
				result,
			);
			await db.read();
			const restaurant = db.data.restaurants.find(
				(r) => r.key === result.scraperKey,
			);

			if (restaurant) {
				// Create the new scraped data entry
				const now = new Date();
				const newEntry = {
					id: db.data.scrapedData.length + 1,
					restaurantId: restaurant.id,
					meals: result.data,
					scrapedAt: now,
					metadata: [],
				};

				// Update the database in a single transaction
				await db.update((state) => {
					state.scrapedData.push(newEntry);
					state.last_scrape = now;
					return state;
				});

				logger.info(
					`[ScraperManager] Saved ${result.data.length} items from ${result.scraperKey}`,
				);
			}

			return true;
		} catch (error) {
			if (error instanceof Error) {
				logger.error(
					`[ScraperManager] Error saving ${result.scraperKey} data: ${error.message}`,
					error,
				);
			} else {
				logger.error(
					`[ScraperManager] Unknown error saving ${result.scraperKey} data`,
					error,
				);
			}

			return false;
		}
	}
}
