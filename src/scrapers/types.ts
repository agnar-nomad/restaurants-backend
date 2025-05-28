import type { Meal } from "@/db/schema.js";

export type ScraperResult = | {
	success: true;
	data: Meal[];
	scraperName: string;
	duration: number;
} | {
    success: false;
    error: string;
    scraperName: string;
    duration: number;
}

export type Scraper = {
	name: string;
	scrape: () => Promise<ScraperResult>;
}
