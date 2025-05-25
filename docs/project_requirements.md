# Restaurants Daily Menu Web Scraper - Product Requirements Document (PRD)

## 1. Overview
A lightweight, configurable web scraper application built with TypeScript that extracts restaurant menu data from target websites based on user-defined configurations.

## 2. Objectives
- Extract structured data from specified websites
- Support multiple target websites with custom selectors
- Store scraped data in a Postgres database
- Store scraped data in a structured format
- Provide basic error handling and logging
- Be maintainable and easily extendable

## 3. Features

### Core Features
- **Configuration Management**
  - Define target URLs and selectors in a config file
  - Support for CSS and XPath selectors
  - Schedule scraping jobs

- **Scraping Engine**
  - HTTP client for making requests
  - HTML parsing and data extraction
  - Support for pagination
  - Rate limiting and request delays

- **Data Handling**
  - Output to a Postgres database
  - Data validation and cleaning

### Technical Requirements
- **Tech Stack**
  - TypeScript
  - Node.js
  - DrizzleORM for database interactions
  - Cheerio/Playwright for web scraping
  - Biomejs for code quality
  - Node-cron for scheduling
  - Express.js for API

- **Project Structure**
  ```
  src/
    ├── config/        # Configuration files
    ├── services/      # Core services
    ├── types/         # TypeScript interfaces/types
    ├── utils/         # Helper functions
    └── index.ts       # Entry point
  ```

## 4. Non-Functional Requirements
- Performance: Handle at least 100 pages per minute
- Reliability: 99.9% success rate for requests
- Error Handling: Comprehensive error logging and retry mechanism
- Security: Respect robots.txt and implement proper request headers

## 5. Future Enhancements
- Authentication support for protected pages
- Headless browser support for JavaScript-heavy sites
- Docker containerization
- API endpoint for triggering scrapes

## 6. Success Metrics
- Data accuracy > 95%
- Uptime > 99%
- Mean time to resolve issues < 4 hours

## 7. Dependencies
- Node.js v18+
- Yarn
- TypeScript 5.6
