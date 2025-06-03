#!/usr/bin/env node
import "dotenv/config";
import { createScraperManager } from "../scrapers/index.js";

async function main() {
	const args = process.argv.slice(2);
	const mode = args[0] === "--concurrent" ? "concurrent" : "sequential";

	console.log(`Starting scrapers in ${mode} mode...\n`);
	const startTime = Date.now();

	const manager = createScraperManager();
	const results =
		mode === "concurrent"
			? await manager.runConcurrently()
			: await manager.runSequentially();

	const totalTime = Date.now() - startTime;
	const successCount = results.filter((r) => r.success).length;

	console.log(`\n=== Scraping completed in ${totalTime}ms ===`);
	console.log(`Success: ${successCount}/${results.length}`);
	console.log("Results:");

	for (const single_res of results) {
		const status = single_res.success ? "✓" : "✗";
		console.log(`
            ${status} ${single_res.scraperKey.padEnd(15)} 
            ${single_res.duration}ms 
            ${single_res.success ? `${single_res.data?.length} items` : `Failed: ${single_res.error}`}
        `);
	}
}

main().catch(console.error);
