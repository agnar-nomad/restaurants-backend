import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import type { ScraperResult } from "../types.js";
import {
	fetchPageHtml,
	getProcessedScraperError,
	getTodayDateCzechStr,
} from "../utils.js";
import type { Meal } from "@/db/schema.js";
import type { RestaurantKey } from "@/db/restaurants_seed.js";

// data shape:
// linear, not properly nested
// <random div>
//     <h2>monday</h2>
//     <p>meal</p>
//     <p>nonsense</p>
//     <p>meal</p>
//     <p>nonsense</p>
//     <h2>tuesday</h2>
//     <p>meal</p>
//     <p>nonsense</p>
//     <p>meal</p>
//     <p>nonsense</p>
//     and so on...
// </random div>

export async function scrapeIndiaThali(): Promise<ScraperResult> {
	const startTime = Date.now();
	const scraperKey: RestaurantKey = "nepal-india-thali";
	const scrapeUrl = "https://www.indiathali.cz/";

	try {
		logger.info(`[${scraperKey}] Starting scraper...`);

		const html = await fetchPageHtml(scrapeUrl);
		const $ = cheerio.load(html);

		let currentDayStr = getTodayDateCzechStr("D. M.");
		let currentDayFound = false;
		let menuItems: Meal[] = [];

		$("main .entry-content")
			.children()
			.each((_, row) => {
				const element = $(row);
				// Check if this is a day header row
				if (element.is("h2.wp-block-heading")) {
					const elText = element.text().trim();

					if (elText.includes(currentDayStr)) {
						// starts actually checking for meals too
						currentDayFound = true;
					}
					if (!elText.includes(currentDayStr)) {
						// stops checking for meals
						currentDayFound = false;
					}

					return;
				}

				// Skip if row does not belong to today
				if (!currentDayFound) {
					return;
				}
				console.log("Current day found: ", currentDayFound, currentDayStr);

				// Check if this is a menu item row
				if (element.is("p")) {
					const elText = element.text().trim();

					if (elText.includes("Nepal Vegetable Noodles")) {
						menuItems.push({
							name: "VEGETARIAN Nepal Vegetable Noodles",
							price: 0,
							description: "nudle & zelená paprika, rajčata, mrkev, cibule",
							allergens: ["1"],
							is_soup: false,
						});

						return;
					}

					if (
						elText.startsWith("*") &&
						!elText.includes("Nepal Vegetable Noodles")
					) {
						const isSoup = elText.toLowerCase().includes("soup");

						// 1. Remove starting * and trim
						let cleanText = elText.replace(/^\*\s*/, "").trim();

						// 2. Remove weight if present (e.g., "150g")
						cleanText = cleanText.replace(/^\d+g\s+/, "").trim();

						// 3. Extract allergens (A: or /A: followed by numbers, can be separated by , or +)
						let allergens: string[] = [];
						const allergenMatch =
							cleanText.match(/\s*[\/,]?\s*A:\s*((?:\d+\s*[+,]\s*)*\d+)/) ||
							cleanText.match(/A:\s*([\d+\s*,\s*]*\d+)/);
						if (allergenMatch) {
							allergens = (allergenMatch[1] || "")
								.split(/\s*[,\+]\s*/)
								.filter((a) => a.trim() !== "")
								.map((a) => a.trim());
						}

						// 4. Extract description (text in first set of parentheses, clean allergens)
						let description = "";
						const descriptionMatch = cleanText.match(/\(([^)]+)/);
						if (descriptionMatch) {
							description = (descriptionMatch[1] || "")
								.replace(/\s*[\/,]?\s*A:\s*((?:\d+\s*[+,]\s*)*\d+)/g, "") // Remove allergen info with + or ,
								.replace(/\s*[,\/]?\s*$/, "") // Remove trailing commas/slashes
								.trim();
						}

						// 5. Clean the name - remove everything in parentheses and normalize spaces
						let name = cleanText
							.replace(/\([^)]*\)/g, "") // Remove everything in parentheses
							.replace(/\s+/g, " ") // Normalize spaces
							.trim();

						// 6. Handle VEG prefix
						if (name.startsWith("VEG ")) {
							name = "VEGETARIAN " + name.substring(4);
						}

						menuItems.push({
							name,
							price: 0,
							description: description || undefined,
							allergens: allergens.length > 0 ? allergens : undefined,
							is_soup: isSoup,
						});

						return;
					}

					if (elText.includes("Přílohy")) {
						menuItems.push({
							name: "Přílohy: Naan [A: 1], Basmati rice, Vegetable salad",
							price: 0,
							is_soup: false,
						});

						return;
					}
				}
			});

		console.log("India Thali Menu items: ", menuItems);

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
