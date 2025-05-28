import { ScraperManager } from "./manager.js";
import { scrapeBuddha } from "./restaurants/buddha.js";
import { scrapeThalie } from "./restaurants/thalie.js";
import { scrapeIndiaThali } from "./restaurants/india-thali.js";
import { scrapePivniceNaRohu } from "./restaurants/pivnice-na-rohu.js";
import { scrapeUTrechCertu } from "./restaurants/u-trech-certu.js";


export function createScraperManager() {
	return new ScraperManager()
		.register({ name: "buddha", scrape: scrapeBuddha })
		.register({ name: "thalie", scrape: scrapeThalie })
		.register({
			name: "nepal-india-thali",
			scrape: scrapeIndiaThali,
		})
		.register({
			name: "pivnice-na-rohu",
			scrape: scrapePivniceNaRohu,
		})
		.register({
			name: "u-trech-certu",
			scrape: scrapeUTrechCertu,
		});
	// Add more scrapers here as they are created
}

export * from "./manager.js";
export * from "./types.js";
