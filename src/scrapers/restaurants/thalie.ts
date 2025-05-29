import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import type { ScraperResult } from "../types.js";
import { fetchPageHtml, getProcessedScraperError, getTodayDateCzechStr } from "../utils.js";
import type { Meal } from "@/db/schema.js";
import type { RestaurantKey } from "@/db/restaurants_seed.js";

// data shape:
// linear, not nested
// <tbody>
//     <tr>monday</tr>
//     <tr>meal</tr>
//     <tr>meal</tr>
//     <tr>tuesday</tr>
//     <tr>meal</tr>
//     <tr>meal</tr>
//     and so on...
// </tbody>

export async function scrapeThalie(): Promise<ScraperResult> {
    const startTime = Date.now();
    const scraperKey: RestaurantKey = "thalie";
    const scrapeUrl = "https://www.thalie.cz/denni-menu/";
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

        let currentDayStr = getTodayDateCzechStr('DD.MM.YYYY')
        let currentDayFound = false;
        let menuItems: Meal[] = [];

        // Process each row in the menu table
        $('.obsah-obal table tbody tr').each((_, row) => {
            const cols = $(row).find('td');
            
            // Check if this is a day header row
            const dayHeader = $(cols[2]).find('i');
            if (dayHeader.length > 0) {
                const dateText = $(dayHeader[0]).text().trim();
                
                if (dateText.includes(currentDayStr)) {
                    currentDayFound = true;
                }
                if(!dateText.includes(currentDayStr)) {
                    currentDayFound = false;
                }
                
                return;
            }
            
            // Skip if row does not belong to today
            if(!currentDayFound) {
                return;
            }
            console.log("Current day found: ", currentDayFound, currentDayStr);

            // Check if this is a menu item row (is soup)
            const soupCell = $(cols[2]).text().trim();
            const soupSynonyms = ["polévka", "ragú", "zelňačka"];
            if (soupCell && soupSynonyms.some(s => soupCell.toLowerCase().includes(s))) {
                // Extract allergens (numbers in the name)
                const allergenRegex = /(\d+)/g;
                const allergens: string[] = [];
                let match;
                
                while ((match = allergenRegex.exec(soupCell)) !== null) {
                    allergens.push(match[0]);
                }

                const cleanName = soupCell
                    .replace(/\s*\d+(?:\s*,\s*\d+)*\s*$/, '')
                    .trim();

                menuItems.push({
                    name: cleanName,
                    price: 0,
                    is_soup: true,
                    allergens,
                });
                
                return;
            }
                
            // Check if this is a menu item row (has price)
            const priceCell = $(cols[3]).text().trim();
            if (priceCell && priceCell.endsWith('Kč')) {
                const name = $(cols[2]).text().trim();
                // Extract allergens (numbers after the name)
                const allergenRegex = /(\d+)/g; 
                const allergens: string[] = [];
                let match;
                
                while ((match = allergenRegex.exec(name)) !== null) {
                    allergens.push(match[0]);
                }

                // Clean the name by removing allergens and extra spaces
                const cleanName = name
                    .replace(/^\d+\.\s*/, '') // Remove leading number and dot with optional space
                    .replace(/\s*\d+(?:\s*,\s*\d+)*\s*$/, '') // Remove allergens at the end
                    .replace(/\s+/g, ' ') // Normalize spaces
                    .trim();

                menuItems.push({
                    name: cleanName,
                    price: parseInt(priceCell.replace(/\D/g, '')), // Extract just the number
                    allergens: allergens.length > 1 ? allergens.slice(1) : undefined,
                    is_soup: false,
                });

                return;
            }
        });

        console.log("Thalie Menu items: ", menuItems);

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
