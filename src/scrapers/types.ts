import type { Meal } from "@/db/schema.js";

export interface ScraperResult {
	success: boolean;
	data?: Meal[];
	error?: string;
	scraperName: string;
	duration: number;
}

export interface Scraper {
	name: string;
	scrape: () => Promise<ScraperResult>;
}
