import { logger } from "@/utils/logger.js";
import { ScraperResult } from "./types.js";
import dayjs from 'dayjs';
import { RestaurantKey } from "@/db/restaurants_seed.js";

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
    logger.error(`[${scraperKey}] Error:`, message);
    return {
        success: false,
        error: message,
        scraperKey,
        duration: Date.now() - startTime,
    };
}