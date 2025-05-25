# Restaurant Menu Scraper

A configurable web scraper for extracting restaurant menu data from various websites using Playwright and Cheerio.

<!-- TODO -->
Restaurants must be added to the db manually, there is no UI for it now and the scripts dont check whether the scraped restaurant is already in the db. So it will not find a restaurant when saving its result to scrapedData table.
<!-- TODO -->

## Features

- Configurable scraping targets with CSS selectors
- Support for both static and dynamic content (Cheerio + Playwright)
- Sequential and concurrent scraping modes
- PostgreSQL storage with Drizzle ORM
- Type-safe codebase with TypeScript
- Logging and error handling
- Command-line interface for running scrapers

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Update the database connection string in `.env`
5. Run database migrations:
   ```bash
   yarn migrate:push
   ```

## Development

- Start development server:
  ```bash
  yarn dev
  ```
- Build for production:
  ```bash
  yarn build
  ```
- Start production server:
  ```bash
  yarn start
  ```

## Running Scrapers

### Run all scrapers sequentially:
```bash
yarn scrape
```

### Run all scrapers concurrently:
```bash
yarn scrape:concurrent
```

### Add a new scraper:
1. Create a new file in `src/scrapers/restaurants/` (e.g., `restaurant2.ts`)
2. Implement a scraper function that returns a `Promise<ScraperResult>`
3. Import and register it in `src/scrapers/index.ts`

Example scraper implementation:

```typescript
// src/scrapers/restaurants/example.ts
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { logger } from '@/utils/logger';
import type { ScraperResult } from '../types';

export async function scrapeExample(): Promise<ScraperResult> {
  const startTime = Date.now();
  const scraperName = 'Example';
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Scraping implementation
    return {
      success: true,
      data: [], // Your scraped data
      scraperName,
      duration: Date.now() - startTime
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
      scraperName,
      duration: Date.now() - startTime
    };
  } finally {
    await browser.close();
  }
}
```

## Database Migrations

- Generate new migration:
  ```bash
  yarn migrate:generate
  ```
- Apply pending migrations:
  ```bash
  yarn migrate:up
  ```
- Revert last migration:
  ```bash
  yarn migrate:down
  ```

## Project Structure

```
src/
  bin/          # Command-line scripts
    scrape.ts   # Scraper CLI
  config/       # Configuration files
  database/     # Database schema and migrations
  scrapers/     # Scraper implementations
    restaurants/ # Individual restaurant scrapers
    manager.ts   # Scraper manager
    types.ts     # Scraper types
  services/     # Business logic
  types/        # TypeScript type definitions
  utils/        # Utility functions
  index.ts      # Application entry point
```

## Environment Variables

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `LOG_LEVEL` - Logging level (default: info)
- `PLAYWRIGHT_BROWSERS_PATH` - Optional: Custom path to Playwright browsers (default: 0, uses system-installed browsers)

## License

ISC
