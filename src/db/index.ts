import { envConfig } from "@/config/env.js";
import { JSONFilePreset } from "lowdb/node"
import { restaurantsList } from "./restaurants_seed.js"
import { Restaurant, ScrapedDataType } from "./schema.js";

type Database = {
    restaurants: Restaurant[]
    scrapedData: ScrapedDataType[]
    last_scrape?: Date | null
}

const defaultData: Database = {
    restaurants: restaurantsList,
    scrapedData: [],
    last_scrape: null
}

const fileName = envConfig.NODE_ENV === "production" ? "db.json" : "test-db.json"
export const db = await JSONFilePreset<Database>(fileName, defaultData)