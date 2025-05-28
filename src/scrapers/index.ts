import { ScraperManager } from "./manager.js";
import { scrapeBuddha } from "./restaurants/buddha.js";
import { scrapeThalie } from "./restaurants/thalie.js";
import { scrapeIndiaThali } from "./restaurants/india-thali.js";
import { scrapePivniceNaRohu } from "./restaurants/pivnice-na-rohu.js";
import { scrapeUTrechCertu } from "./restaurants/u-trech-certu.js";

// Restaurant names, these names have to match names in the DB
// TODO make this less fragile
export const RESTAURANT_NAMES = {
	buddha: "Buddha Restaurant",
	thalie: "Thalie",
    nepalIndiaThali: "Nepal India Thali",
    pivniceNaRohu: "Pivnice na Rohu",
    uTrechCertu: "U třech čertů",
} as const;

export function createScraperManager() {
	return (
		new ScraperManager()
			.register({ name: RESTAURANT_NAMES.buddha, scrape: scrapeBuddha })
			.register({ name: RESTAURANT_NAMES.thalie, scrape: scrapeThalie })
			.register({ name: RESTAURANT_NAMES.nepalIndiaThali, scrape: scrapeIndiaThali })
			.register({ name: RESTAURANT_NAMES.pivniceNaRohu, scrape: scrapePivniceNaRohu })
            .register({ name: RESTAURANT_NAMES.uTrechCertu, scrape: scrapeUTrechCertu })
		);
	// Add more scrapers here as they are created
}

export * from "./manager.js";
export * from "./types.js";
