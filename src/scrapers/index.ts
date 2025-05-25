import { ScraperManager } from "./manager.js";
import { scrapeBuddha } from "./restaurants/buddha.js";
import { scrapeProfitak } from "./restaurants/profitak.js";

export const RESTAURANT_NAMES = {
	profitak: "Profitak",
	buddha: "Buddha Restaurant",
} as const;

export function createScraperManager() {
	return (
		new ScraperManager()
			// .register({ name: 'Profitak', scrape: scrapeProfitak })
			.register({ name: RESTAURANT_NAMES.buddha, scrape: scrapeBuddha })
	);
	// Add more scrapers here as they are created
}

export * from "./restaurants/profitak.js";
export * from "./manager.js";
export * from "./types.js";
