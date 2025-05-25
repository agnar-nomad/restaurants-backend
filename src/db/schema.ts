import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const restaurantsTable = pgTable("restaurants", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	url: varchar("url", { length: 1024 }).notNull(),
	address: text("address").notNull(),
	acceptsCards: boolean("accepts_cards"),
	coordinates: jsonb("coordinates").$type<[number, number]>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define the Meal type for TypeScript
export type Meal = {
	name: string;
	price: number;
	description?: string;
	alergens?: string[];
	is_vegan?: boolean;
	is_gluten_free?: boolean;
	is_soup?: boolean;
};

export const scrapedDataTable = pgTable("scraped_data", {
	id: serial("id").primaryKey(),
	restaurantId: integer("restaurant_id")
		.references(() => restaurantsTable.id)
		.notNull(),
	content: jsonb("content").$type<Meal[]>(),
	metadata: jsonb("metadata"),
	scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

// Schema for validation
// Restaurant schema and types
const restaurantSchema = {
	name: z.string().min(1, "Name is required"),
	url: z.string().url("Invalid URL").min(1, "URL is required"),
	address: z.string().min(1, "Address is required"),
	acceptsCards: z.boolean().optional(),
	coordinates: z.tuple([z.number(), z.number()]).optional(),
};

export const insertRestaurantSchema = z.object(restaurantSchema);
export const selectRestaurantSchema = z.object({
	id: z.number(),
	...restaurantSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Restaurant = z.infer<typeof selectRestaurantSchema>;
export type NewRestaurant = z.infer<typeof insertRestaurantSchema>;

// ScrapedData schema and types
const mealSchema = z.object({
	name: z.string().min(1, "Meal name is required"),
	price: z.number().positive("Price must be a positive number"),
	description: z.string().optional(),
	alergens: z.array(z.string()).optional(),
	is_vegan: z.boolean().optional(),
	is_gluten_free: z.boolean().optional(),
	is_soup: z.boolean().optional(),
});

const scrapedDataSchema = {
	restaurantId: z.number().positive("Invalid restaurant ID"),
	content: z.array(mealSchema).min(1, "At least one meal is required"),
	metadata: z.record(z.unknown()).optional(),
};

export const insertScrapedDataSchema = z.object(scrapedDataSchema);
export const selectScrapedDataSchema = z.object({
	id: z.number(),
	...scrapedDataSchema,
	scrapedAt: z.date(),
});

export type ScrapedDataType = z.infer<typeof selectScrapedDataSchema>;
export type NewScrapedDataType = z.infer<typeof insertScrapedDataSchema>;
