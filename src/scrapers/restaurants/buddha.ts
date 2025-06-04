import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
// import { chromium } from "playwright";
import type { ScraperResult } from "../types.js";
import {
	getProcessedScraperError,
	getTodayDateCzechStr,
	fetchPageHtml,
} from "../utils.js";
import type { Meal } from "@/db/schema.js";
import { RestaurantKey } from "@/db/restaurants_seed.js";

export async function scrapeBuddha(): Promise<ScraperResult> {
	const startTime = Date.now();
	const scraperKey: RestaurantKey = "buddha";
	const scrapeUrl = "https://www.menicka.cz/9564-buddha.html";
	// const browser = await chromium.launch({ headless: true });

	try {
		logger.info(`[${scraperKey}] Starting scraper...`);
		// const page = await browser.newPage();
		// await page.goto(scrapeUrl, {
		//     waitUntil: "networkidle",
		//     timeout: 30000,
		// });

		// const html = await page.content();

		const html = await fetchPageHtml(scrapeUrl);
		const $ = cheerio.load(html);

		let currentDayStr = getTodayDateCzechStr("D.M.YYYY");
		let menuItems: Meal[] = [];

		const todayMenu = $(".profile .obsah .menicka")
			.filter((_, el) => {
				const heading = $(el).find(".nadpis").text().trim();
				return heading.includes(currentDayStr);
			})
			.first();

		const soupRows = todayMenu.find("li.polevka");

        console.log( todayMenu.text());
		soupRows.each((_, el) => {
			const item = $(el);
			const soupText = item.find(".polozka").text().trim();

			// Extract all parenthetical groups
			const parenthesesGroups = soupText.match(/\(([^)]+)\)/g) || [];

			let description = "";
			let allergens: string[] = [];

			// Process the first group as description if it exists
			if (parenthesesGroups.length > 0) {
				description = parenthesesGroups[0]?.replace(/[()]/g, "").trim() || "";
			}

			// Process the second group as allergens if it exists and contains only numbers
			if (parenthesesGroups.length > 1) {
				const potentialAllergens =
					parenthesesGroups[1]?.replace(/[()]/g, "").trim() || "";
				if (/^\d+$/.test(potentialAllergens)) {
					allergens = potentialAllergens
						.split("")
						.filter((a) => a.trim() !== "");
				}
			}

			const allergenFromEm = item.find(".polozka em").text().trim();
			if (allergenFromEm) {
				allergens.push(allergenFromEm);
			}

			const cleanName = soupText
				.replace(/^\d+,\s*\d*l\s*/, "") // Remove the leading quantity (e.g., "0, 2l ")
				.replace(/\s*\([^)]+\)/g, "") // Remove all parenthetical content
				.replace(/\s*\d+$/, "") // Remove any trailing numbers at the end
				.replace(/\s+/g, " ") // Normalize spaces
				.trim();

			const soupPrice = item.find(".cena").text().trim().replace(/\s+Kč/g, "");

			menuItems.push({
				name: cleanName,
				price: parseInt(soupPrice) || 0,
				description: description || undefined,
				is_soup: true,
				allergens,
			});
		});

		const dishRows = todayMenu.find("li.jidlo");
        console.log("dishRows: ", dishRows.text(), todayMenu.text());
		dishRows.each((_, el) => {
			const item = $(el);
			const dishText = item.find(".polozka").text().trim();

			// Extract all parenthetical groups
			const parenthesesGroups = dishText.match(/\(([^)]+)\)/g) || [];

			let description = "";
			let allergens: string[] = [];

			// Process the first group as description if it exists
			if (parenthesesGroups.length > 0) {
				description = parenthesesGroups[0]?.replace(/[()]/g, "").trim() || "";
			}

			// Process the second group as allergens if it exists and contains only numbers
			if (parenthesesGroups.length > 1) {
				const potentialAllergens =
					parenthesesGroups[1]?.replace(/[()]/g, "").trim() || "";
				if (/^\d+$/.test(potentialAllergens)) {
					allergens = potentialAllergens
						.split("")
						.filter((a) => a.trim() !== "");
				}
			}

			const allergenFromEm = item.find(".polozka em").text().trim();
			if (allergenFromEm) {
				allergens.push(allergenFromEm);
			}

			const cleanName = dishText
				.replace(/\d+\.\s*/, "") // Remove number at the beginning e.g. 2.
				.replace(/\d+g\s*/, "") // Remove weight info, e.g. 150g
				.replace(/\s*\([^)]+\)/g, "") // Remove all parenthetical content
				.replace(/\s*\d+$/, "") // Remove any trailing numbers at the end
				.replace(/\s+/g, " ") // Normalize spaces
				.trim();

			const dishPrice = item.find(".cena").text().trim().replace(/\s+Kč/g, "");

			menuItems.push({
				name: cleanName,
				price: parseInt(dishPrice) || 0,
				description: description || undefined,
				is_soup: false,
				allergens,
			});
		});

		console.log("Buddha items: ", menuItems);

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
	} finally {
		// await browser.close();
	}
}
