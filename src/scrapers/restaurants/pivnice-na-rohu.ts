import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import type { ScraperResult } from "../types.js";
import { fetchPageHtml, getProcessedScraperError } from "../utils.js";
import type { Meal } from "@/db/schema.js";
import type { RestaurantKey } from "@/db/restaurants_seed.js";

// data shape:
// <random div with random class id>
//     <p with random class id>
//      soups
//     </p>
//     <p with random class id, but is a sibling>
//      main dishes
//     </p>
// </random div with random class id>

export async function scrapePivniceNaRohu(): Promise<ScraperResult> {
	const startTime = Date.now();
	const scraperKey: RestaurantKey = "pivnice-na-rohu";
	const scrapeUrl = "https://www.pivnicenarohu.cz/kopie-poledn%C3%AD-menu";

	try {
		logger.info(`[${scraperKey}] Starting scraper...`);
		
        const html = await fetchPageHtml(scrapeUrl, {
			waitUntil: "domcontentloaded",
		});
		const $ = cheerio.load(html);

		// they only have one menu, available the whole week, so we just pick it up every day
		let menuItems: Meal[] = [];

		// Find the paragraph containing soup indicators
		const soupParagraph = $(
			'div[data-testid="mesh-container-content"] div p:contains("P1:")',
		).first();
		if (!soupParagraph.length) {
			throw new Error("Could not find soup items on the page");
		}

		// Get the sibling paragraph which contains the main dishes
		const mainDishesParagraph = soupParagraph.next("p");
		if (!mainDishesParagraph.length) {
			throw new Error("Could not find main dishes on the page");
		}

		// Process soups
		const soupsText = soupParagraph.text();
		const soups = soupsText
			.split("\n")
			.filter((line) => line.trim().startsWith("P"))
			.map((soup) => soup.replace(/^P\d+:\s*/, "").trim());

		// Add soups to menuItems
		soups.forEach((soup) => {
			menuItems.push({
				name: soup,
				price: 20, // mentioned on the page
				is_soup: true,
				allergens: undefined,
			});
		});

		// Process main dishes
		const dishesText = mainDishesParagraph.text();
		const dishLines = dishesText
			.split("\n")
			.filter((line) => /^\d+\.\s/.test(line.trim())); // starts with NUM.

		dishLines.forEach((dish) => {
			const cleanName = dish.replace(/^\d+\.\s*/, "").trim();

			menuItems.push({
				name: cleanName,
				price: 159, // mentioned on the page
				is_soup: false,
				allergens: undefined,
			});
		});

		console.log("Pivnice na Rohu items: ", menuItems);

		return {
			success: true,
			data: menuItems,
			scraperKey,
			duration: Date.now() - startTime,
		};
	} catch (error) {
		return getProcessedScraperError({
			error,
			scraperKey,
			startTime,
		});
	}
}
