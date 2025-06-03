import { logger } from "@/utils/logger.js";
import { ScraperResult } from "./types.js";
import dayjs from "dayjs";
import { RestaurantKey } from "@/db/restaurants_seed.js";
import puppeteer from "puppeteer";

export function getTodayDateCzechStr(format?: string): string {
	// For current date with leading zeros or custom format
	return dayjs().format(format || "DD.MM.YYYY");
}

type GetProcessedScraperErrorType = {
	error: unknown;
	scraperKey: RestaurantKey;
	startTime: number;
};
export function getProcessedScraperError({
	error,
	scraperKey,
	startTime,
}: GetProcessedScraperErrorType): ScraperResult {
	const message = error instanceof Error ? error.message : "Unknown error";
	console.log(
		"getProcessedScraperError",
		"message:",
		message || "NO Message",
		"stringified error:",
		JSON.stringify(error, null, 2),
	);
	logger.error(`[${scraperKey}] Error:`, message);
	return {
		success: false,
		error: message,
		scraperKey,
		duration: Date.now() - startTime,
	};
}

type FetchPageHtmlOptions = {
	waitUntil: puppeteer.GoToOptions["waitUntil"];
};
export async function fetchPageHtml(
	url: string,
	options?: FetchPageHtmlOptions,
): Promise<string> {
	const waitUntil = options?.waitUntil || "networkidle2";

	const browser = await puppeteer.launch({
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--single-process",
			"--disable-gpu",
			"--disable-extensions",
			"--disable-blink-features=AutomationControlled", // Important for avoiding detection
		],
	});

	console.log("browser launched", browser);

	try {
		const page = await browser.newPage();
		await page.setUserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
		);
		await page.setViewport({ width: 1366, height: 768 });

		await page.setExtraHTTPHeaders({
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"Accept-Language": "en-US,en;q=0.9,cs;q=0.8", // Added Czech language
			"Accept-Encoding": "gzip, deflate, br",
			Connection: "keep-alive",
			"Upgrade-Insecure-Requests": "1",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			"Sec-Ch-Ua": '"Chromium";v="136", "Not.A/Brand";v="24"',
			"Sec-Ch-Ua-Platform": '"Linux"',
			Referer: "https://www.google.com/",
			// 'Sec-Fetch-Site': 'cross-site',
		});
		console.log("page set up");

		// Add a small delay before navigation
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Navigate to the page and wait until [based on option specified]
		await page.goto(url, {
			waitUntil,
			timeout: 30000,
		});
		console.log("page navigated");

		// Wait for a specific selector if needed
		// await page.waitForSelector('your-selector', { timeout: 10000 });

		// Get the full page HTML
		const html = await page.content();
		console.log("html fetched");

		return html;
	} catch (e) {
		throw new Error(`Error fetching page html: ${url} - ${e}`);
	} finally {
		await browser.close();
	}
}
