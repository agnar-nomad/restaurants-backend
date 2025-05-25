import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import type { ScraperResult } from "../types.js";
import { RESTAURANT_NAMES } from "../index.js";

export async function scrapeBuddha(): Promise<ScraperResult> {
	const startTime = Date.now();
	const scraperName = RESTAURANT_NAMES.buddha;
	const url = "https://www.menicka.cz/9564-buddha.html";
	const browser = await chromium.launch({ headless: true });

	try {
		logger.info(`[${scraperName}] Starting scraper...`);
		const page = await browser.newPage();
		await page.goto(url, {
			waitUntil: "networkidle",
			timeout: 30000,
		});

		const html = await page.content();
		const $ = cheerio.load(html);

		const menuItems = $(".obsah .menicka")
			.map((_i, el) => ({
				name: $(el).find(".nadpis").text().trim(),
				//   price: parseFloat(
				//     $(el).find('.item-price')
				//       .text()
				//       .replace('€', '')
				//       .replace(',', '.')
				//       .trim()
				//   ),
				//   description: $(el).find('.item-description').text().trim(),
			}))
			.get();

			console.log("Buddha items: ", menuItems);

			return {
				success: true,
				data: menuItems as any, // TODO: fix type
			scraperName,
			duration: Date.now() - startTime,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error(`[${scraperName}] Error:`, message);
		return {
			success: false,
			error: message,
			scraperName,
			duration: Date.now() - startTime,
		};
	} finally {
		await browser.close();
	}
}
