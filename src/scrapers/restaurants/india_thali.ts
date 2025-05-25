import { logger } from "@/utils/logger.js";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import type { ScraperResult } from "../types.js";
import { RESTAURANT_NAMES } from "../index.js";
import { getProcessedScraperError, getTodayDateCzechStr } from "../utils.js";
import type { Meal } from "@/db/schema.js";

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
    const scraperName = RESTAURANT_NAMES.nepalIndiaThali;
    const url = "https://www.indiathali.cz/";
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

        let currentDayStr = getTodayDateCzechStr('DD. M.')
        let currentDayFound = false;
        let menuItems: Meal[] = [];

        $('main .entry-content').children().each((_, row) => {
            
            const element = $(row);
            // Check if this is a day header row
            if (element.is('h2.wp-block-heading')) {
                const elText = element.text().trim();

                if (elText.includes(currentDayStr)) {
                    // starts actually checking for meals too
                    currentDayFound = true;
                }
                if(!elText.includes(currentDayStr)) {
                    // stops checking for meals
                    currentDayFound = false;
                }
                
                return;
            }
            
            // Skip if row does not belong to today
            if(!currentDayFound) {
                return;
            }
            console.log("Current day found: ", currentDayFound, currentDayStr);

            // Check if this is a menu item row
            if (element.is('p')) {
                const elText = element.text().trim();

                if(elText.includes('Nepal Vegetable Noodles')) {
                    menuItems.push({
                        name: "VEGETARIAN Nepal Vegetable Noodles",
                        price: 0,
                        description: "nudle & zelená paprika, rajčata, mrkev, cibule",
                        allergens: ["1"],
                        is_soup: false
                    })

                    return;
                }

                if(elText.startsWith('*') && !elText.includes('Nepal Vegetable Noodles')) {
                    const isSoup = elText.toLowerCase().includes("soup");

                    // 1. Remove starting * and trim
                    let cleanText = elText.replace(/^\*\s*/, '').trim();
                    
                    // 2. Remove weight if present (e.g., "150g")
                    cleanText = cleanText.replace(/^\d+g\s+/, '').trim();
                    
                    // 3. Extract allergens (A: or /A: followed by numbers)
                    let allergens: string[] = [];
                    const allergenMatch = cleanText.match(/[\/,]\s*A:\s*(\d+(?:\s*,\s*\d+)*)/) || 
                                        cleanText.match(/A:\s*(\d+(?:\s*,\s*\d+)*)/);
                    if (allergenMatch) {
                        allergens = (allergenMatch[1] || "").split(/\s*,\s*/).map(a => a.trim());
                    }
                    
                    // 4. Extract description (text in parentheses, excluding allergen info)
                    let description = '';
                    const descriptionMatch = cleanText.match(/\(([^)]+?)(?:\s*[\/,]\s*A:|\s*A:)?\s*\d*\s*[)\/]/);
                    if (descriptionMatch) {
                        description = (descriptionMatch[1] || "").trim();
                    }
                    
                    // 5. Extract name (remaining text before parentheses)
                    let name = cleanText
                        .replace(/\s*\([^)]*\)/, '')  // Remove everything in parentheses
                        .replace(/\s*[\/,]\s*A:.*$/, '') // Remove any trailing A:... after slash
                        .trim();
                    
                    // 6. Handle VEG prefix
                    if (name.startsWith('VEG ')) {
                        name = 'VEGETARIAN ' + name.substring(4);
                    }
                    
                    menuItems.push({
                        name,
                        price: 0,
                        description: description || undefined,
                        allergens: allergens.length > 0 ? allergens : undefined,
                        is_soup: isSoup
                    })

                    return;
                }

                if(elText.includes('Přílohy')) {
                    menuItems.push({
                        name: "Přílohy: Naan (A: 1), Basmati rice, Vegetable salat",
                        price: 0,
                        is_soup: false
                    })

                    return;
                }
            }
        });

        console.log("India Thali Menu items: ", menuItems);

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
