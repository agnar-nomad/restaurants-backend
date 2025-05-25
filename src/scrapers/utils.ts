import { logger } from "@/utils/logger.js";
import { ScraperResult } from "./types.js";
import dayjs from 'dayjs';

export function getTodayDateCzechStr(format?: string): string {
    // For current date with leading zeros or custom format
    return dayjs().format(format || 'DD.MM.YYYY');
}

type GetProcessedScraperErrorType = {
    error: unknown,
    scraperName: string,
    startTime: number,
}
export function getProcessedScraperError({
    error,
    scraperName,
    startTime,
}: GetProcessedScraperErrorType): ScraperResult {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`[${scraperName}] Error:`, message);
    return {
        success: false,
        error: message,
        scraperName,
        duration: Date.now() - startTime,
    };
}