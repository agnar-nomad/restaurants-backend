import type { Meal } from "@/db/schema.js";
import type { RestaurantKey } from "@/db/restaurants_seed.js";

export type ScraperResult = | {
	success: true;
	data: Meal[];
	scraperName: RestaurantKey;
	duration: number;
} | {
    success: false;
    error: string;
    scraperName: RestaurantKey;
    duration: number;
}

export type Scraper = {
	name: RestaurantKey;
	scrape: () => Promise<ScraperResult>;
}
