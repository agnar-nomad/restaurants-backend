# Restaurant Menu Scraper API

A robust web scraper and API service for extracting and serving restaurant menu data from various websites. Built with TypeScript, Express, and Playwright.

## Features

- 🚀 RESTful API for accessing scraped menu data
- ⚡ Support for both static and dynamic content (Cheerio + Playwright)
- 🔄 Scheduled scraping with node-cron
- 📦 Type-safe codebase with TypeScript
- 📝 Comprehensive logging with Winston
- 🐳 Docker and Kubernetes ready
- 🔍 Multiple scraping strategies (sequential and concurrent)

## Prerequisites

- Node.js 18+
- Yarn
- Playwright (installed automatically with dependencies)
- Docker (optional, for containerized deployment)
- Kubernetes (optional, for orchestration)

## Getting Started

### Installation

Install dependencies:
   ```bash
   yarn install
   ```

Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

### Development

- Start development server with hot-reload:
  ```bash
  yarn dev
  ```

- Run the scraper:
  ```bash
  yarn scrape
  ```
  
  For concurrent scraping (faster but more resource-intensive):
  ```bash
  yarn scrape:concurrent
  ```

### Building for Production

1. Build the application:
   ```bash
   yarn build
   ```

2. Start the production server:
   ```bash
   yarn start
   ```

## Project Structure

```
├── src/
│   ├── bin/           # Command-line scripts
│   │   └── scrape.ts  # Scraper CLI
│   ├── config/        # Configuration files
│   ├── db/            # Database models and utilities
│   ├── scrapers/      # Scraper implementations
│   │   └── restaurants/ # Individual restaurant scrapers
│   ├── utils/         # Utility functions
│   ├── cron.ts        # Scheduled tasks
│   └── index.ts       # Application entry point
├── k8s/               # Kubernetes deployment files
├── docs/              # Documentation
└── data/              # Data storage
```

## Environment Variables

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)

## Deployment

### Docker

Build the Docker image:
```bash
docker build -t restaurants-backend .
```

Run the container:
```bash
docker run -d --name obedy-backend   -p 4242:4242   -v $(pwd)/data:/app/data   --cap-add=SYS_ADMIN   --shm-size=1g   restaurants-backend

```