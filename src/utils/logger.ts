import { envConfig } from "@/config/env.js";
import winston from "winston";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	verbose: "blue",
	debug: "white",
	silly: "grey",
};

winston.addColors(colors);

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
	),
);

const transports = [
	new winston.transports.Console(),
	new winston.transports.File({
		filename: "logs/error.log",
		level: "error",
	}),
	new winston.transports.File({ filename: "logs/all.log" }),
];

export const logger = winston.createLogger({
	level: envConfig.LOG_LEVEL,
	levels,
	format,
	transports,
});

export type Logger = typeof logger;
