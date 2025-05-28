import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import type { ScraperResult } from "../types.js";
import { RESTAURANT_NAMES } from "../index.js";
import { getProcessedScraperError, getTodayDateCzechStr } from "../utils.js";
import type { Meal } from "@/db/schema.js";


export async function scrapeUTrechCertu(): Promise<ScraperResult> {
    const startTime = Date.now();
    const scraperName = RESTAURANT_NAMES.uTrechCertu;
    const url = "https://www.menicka.cz/8401-u-trech-certu-dvorakova.html";
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

        let currentDayStr = getTodayDateCzechStr('DD.M.YYYY')
        let menuItems: Meal[] = [];

        const todayMenu = $('.profile .obsah .menicka')
            .filter((_, el) => {
                const heading = $(el).find('.nadpis').text().trim();
                return heading.includes(currentDayStr);
            }).first();

        const soupRows = todayMenu.find('li.polevka').first()
        soupRows.each((_, el) => {
            const item = $(el)
            const soupText = item.find('.polozka').text().trim();
            
            const cleanName = soupText
                .replace(/^\s*Polévka:\s*/i, '')
                .replace(/\s*\d+\s*$/, '') // Remove any trailing numbers at the end
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();

            const allergens: string[] = [];

            item.find('.polozka em').each((_, el) => {
                const allergen = $(el).text().trim()
                if(allergen) {
                    allergens.push(allergen)
                }
            })

            menuItems.push({
                name: cleanName,
                price: 0,
                is_soup: true,
                allergens: allergens.length > 0 ? allergens : undefined,
            })
        })

        const dishRows = todayMenu
            .find('li.jidlo, li.polevka') // some main dishes are under class polevka
            .filter((_, el) => {
                const text = $(el).find('.polozka').text().trim();
                return !text.includes('Polévka:');
            });

        dishRows.each((_, el) => {
            const item = $(el)
            const dishText = item.find('.polozka').text().trim();

            const cleanName = dishText
            .replace(/\d+\.\s*/, '') // Remove number at the beginning e.g. 2.
            .replace(/\s*T\s*\d+\s*\)/, '') // Remove T 3) at the beginning
            .replace(/\s*A\)\s*/, '') // Remove A) at the beginning
            .replace(/\s*B\)\s*/, '') // Remove B) at the beginning
            .replace(/\s*\d+$/, '') // Remove any trailing numbers at the end
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
            
            const dishPrice = item.find('.cena')
            .text()
            .trim()
            .replace(/\s*Kč/g, '');

            const allergens: string[] = [];

            item.find('.polozka em').each((_, el) => {
                const allergen = $(el).text().trim()
                if(allergen) {
                    allergens.push(allergen)
                }
            })

            menuItems.push({
                name: cleanName,
                price: parseInt(dishPrice) || 0,
                is_soup: false,
                allergens: allergens.length > 0 ? allergens : undefined,
            })
        })

        console.log("UTrechCertu items: ", menuItems);

        return {
            success: true,
            data: menuItems,
            scraperName,
            duration: Date.now() - startTime,
        };
    } catch (error) {
        return getProcessedScraperError({
            error,
            scraperName,
            startTime,
        });
    } finally {
        await browser.close();
    }
}
