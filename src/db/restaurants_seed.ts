import { logger } from "@/utils/logger.js";
import { selectRestaurantSchema } from "./schema.js";
import { z } from "zod";

// Raw restaurant data with const assertion to preserve literal types
const restaurantsData = [
	{
		id: 1,
		name: "Thalie",
		key: "thalie",
		url: "https://www.thalie.cz/denni-menu/",
		address: "Rooseveltova 14, 602 00 Brno",
		acceptsCards: true,
		coordinates: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 2,
		name: "Buddha Restaurant",
		key: "buddha",
		url: "https://www.indian-restaurant-buddha.cz/",
		address: "Náměstí Svobody 21, 602 00 Brno",
		acceptsCards: true,
		coordinates: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 3,
		name: "U třech čertů",
		key: "u-trech-certu",
		url: "https://www.menicka.cz/8401-u-trech-certu-dvorakova.html",
		address: "Dvořákova 645/6, 602 00, Brno",
		acceptsCards: true,
		coordinates: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 4,
		name: "Nepal India Thali",
		key: "nepal-india-thali",
		url: "https://www.indiathali.cz/",
		address: "IBC, Příkop 6, 602 00 Brno",
		acceptsCards: true,
		coordinates: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 5,
		name: "Pivnice na Rohu",
		key: "pivnice-na-rohu",
		url: "https://www.pivnicenarohu.cz/kopie-poledn%C3%AD-menu",
		address: "Divadelní 614/6, 602 00, Brno",
		acceptsCards: true,
		coordinates: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
] as const;

const dataSchema = z.array(selectRestaurantSchema);

function parseRestaurantsData() {
	const result = dataSchema.safeParse(restaurantsData);
	if (!result.success) {
		logger.error("Error parsing restaurants data:", result.error);
		return [];
	}
	return result.data;
}

export const restaurantsList = parseRestaurantsData();

export type RestaurantKey = (typeof restaurantsData)[number]["key"];
