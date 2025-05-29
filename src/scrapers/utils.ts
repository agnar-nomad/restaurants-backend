import { logger } from "@/utils/logger.js";
import { ScraperResult } from "./types.js";
import dayjs from 'dayjs';
import { RestaurantKey } from "@/db/restaurants_seed.js";
import puppeteer from 'puppeteer';

export function getTodayDateCzechStr(format?: string): string {
    // For current date with leading zeros or custom format
    return dayjs().format(format || 'DD.MM.YYYY');
}

type GetProcessedScraperErrorType = {
    error: unknown,
    scraperKey: RestaurantKey,
    startTime: number,
}
export function getProcessedScraperError({
    error,
    scraperKey,
    startTime,
}: GetProcessedScraperErrorType): ScraperResult {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log("error", message, JSON.stringify(error, null, 2));
    logger.error(`[${scraperKey}] Error:`, message);
    return {
        success: false,
        error: message,
        scraperKey,
        duration: Date.now() - startTime,
    };
}

type FetchPageHtmlOptions = {
    waitUntil: puppeteer.GoToOptions["waitUntil"]
}
export async function fetchPageHtml(url: string, options?: FetchPageHtmlOptions): Promise<string> {
    const waitUntil = options?.waitUntil || "networkidle2"

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to the page and wait for network to be idle
        await page.goto(url, {
            waitUntil,
            timeout: 30000
        });

        // Wait for a specific selector if needed
        // await page.waitForSelector('your-selector', { timeout: 10000 });

        // Get the full page HTML
        const html = await page.content();
        return html;
    } catch (e) {
        throw new Error(`Error fetching page html: ${url} - ${e}`);
    } finally {
        await browser.close();
    }
}