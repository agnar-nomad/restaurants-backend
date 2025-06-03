const { join } = require("path");

module.exports = {
	// Cache directory for Puppeteer
	cacheDirectory: join(__dirname, ".cache", "puppeteer"),

	// Launch configuration
	launch: {
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-accelerated-2d-canvas",
			"--no-first-run",
			"--no-zygote",
			"--single-process",
			"--disable-gpu",
			"--disable-software-rasterizer",
			"--disable-features=site-per-process",
			"--disable-web-security",
			"--disable-features=IsolateOrigins,site-per-process",
			"--disable-setuid-sandbox",
			"--disable-blink-features=AutomationControlled",
		],
		defaultViewport: {
			width: 1280,
			height: 800,
		},
		ignoreHTTPSErrors: true,
		dumpio: false,
	},
};
