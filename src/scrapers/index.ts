import { ScraperManager } from "./manager.js";
import { scrapeBuddha } from "./restaurants/buddha.js";
import { scrapeThalie } from "./restaurants/thalie.js";
import { scrapeIndiaThali } from "./restaurants/india_thali.js";

// Restaurant names, these names have to match names in the DB
// TODO make this less fragile
export const RESTAURANT_NAMES = {
	buddha: "Buddha Restaurant",
	thalie: "Thalie",
    nepalIndiaThali: "Nepal India Thali",
} as const;

export function createScraperManager() {
	return (
		new ScraperManager()
			// .register({ name: RESTAURANT_NAMES.buddha, scrape: scrapeBuddha })
			.register({ name: RESTAURANT_NAMES.thalie, scrape: scrapeThalie })
			.register({ name: RESTAURANT_NAMES.nepalIndiaThali, scrape: scrapeIndiaThali })
	);
	// Add more scrapers here as they are created
}

export * from "./manager.js";
export * from "./types.js";
