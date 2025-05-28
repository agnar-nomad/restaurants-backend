import { z } from "zod";

// Restaurant schema and types
const restaurantSchema = {
	name: z.string().min(1, "Name is required"),
	key: z.string(),
	url: z.string().url("Invalid URL").min(1, "URL is required"),
	address: z.string().min(1, "Address is required"),
	acceptsCards: z.boolean().optional(),
	coordinates: z.nullable(z.tuple([z.number(), z.number()])),
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

// Meal schema and types
const mealSchema = z.object({
	name: z.string().min(1, "Meal name is required"),
	price: z.number().positive("Price must be a positive number"),
	description: z.string().optional(),
	allergens: z.array(z.string()).optional(),
	is_vegan: z.boolean().optional(),
	is_gluten_free: z.boolean().optional(),
	is_soup: z.boolean().optional(),
});

export type Meal = z.infer<typeof mealSchema>;

// ScrapedData schema and types
const scrapedDataSchema = {
	restaurantId: z.number().positive("Invalid restaurant ID"),
	meals: z.array(mealSchema).min(1, "At least one meal is required"),
	metadata: z.array(z.record(z.string(), z.string().or(z.number()))).optional(),
};

export const insertScrapedDataSchema = z.object(scrapedDataSchema);
export const selectScrapedDataSchema = z.object({
	id: z.number(),
	...scrapedDataSchema,
	scrapedAt: z.date(),
});

export type ScrapedDataType = z.infer<typeof selectScrapedDataSchema>;
export type NewScrapedDataType = z.infer<typeof insertScrapedDataSchema>;
