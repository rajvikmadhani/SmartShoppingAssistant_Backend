# SmartShoppingAssistant_Backend - Project Summary: SSA

The SSA Backend is a Node.js + Express.js powered system designed to support a smart shopping assistant web application. It enables real-time product price comparisons, historical price tracking, and personalized deal notifications by scraping data from e-commerce sites like Amazon, eBay, Newegg and BackMarket.

### Contributions

- [Mounika](https://github.com/Mounika-Nanjala)
- [Rajvi](https://github.com/rajvikmadhani)
- [Alireza](https://github.com/Alireza2A)
- [Andrei](https://github.com/raizy21)

are maintainers for this repository.

## Deployment

### Backend

**GitHub Repository**:  
[https://github.com/Alireza2A/SmartShoppingAssistant_Backend](https://github.com/Alireza2A/SmartShoppingAssistant_Backend)

The backend is live and hosted on [Render](https://render.com/):

**Base API URL**:  
[https://smartshoppingassistant-backend.onrender.com/](https://smartshoppingassistant-backend.onrender.com/)

All API routes (e.g., `/api/auth`, `/api/products`,`/api/liveData`, `/api/notifications`,`/api/price-alerts`, `/api/scrapingJob`,`/api/coupons`, `/api/wishlist`, `/api/users` ) are accessible from this domain.

---

### Frontend

**GitHub Repository**:  
[https://github.com/rajvikmadhani/SmartShoppingAssistant_Frontend](https://github.com/rajvikmadhani/SmartShoppingAssistant_Frontend)

**Live Deployment**:  
[https://smartshoppingassistant-frontend.onrender.com/](https://smartshoppingassistant-frontend.onrender.com/)

# Key Technologies

- Backend: Node.js + Express.js
- Database: PostgreSQL (hosted on Neon)
- Web Scraping: Puppeteer
- Queue & Background Jobs: BullMQ + Redis
- Real-time Updates: WebSockets / Polling
- Notifications: Email (Nodemailer) & Push (Firebase)

## Folder Structure

````bash
SmartShoppingAssistant_Backend/
├── .gitignore               # Files and folders to ignore in Git
├── README.md                # Project documentation and overview
├── package.json             # Project metadata, dependencies, and scripts
├── package-lock.json        # Ensures consistent installs across environments

└── src/                     # Main source code directory
    ├── config/              # App configuration (DB, Redis, BullMQ, etc.)
    ├── controllers/         # Route controllers — request handlers
    ├── db/                  # DB init files, connection logic, seeders
    ├── middleware/          # Express middleware (auth, validation, error handling)
    ├── models/              # Sequelize models — define DB schema
    ├── routes/              # API route definitions and modular route files
    ├── schemas/             # Joi validation schemas for request validation
    ├── services/            # Business logic and services (scrapers, notifications, etc.)
    ├── test/                # Unit and integration test files
    ├── utils/               # Utility functions and helpers
    └── server.js            # Main Express app entry point

## Prerequisites

Before running this server, ensure you have the following installed:

- [nodejs](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository:

   ```bash
   git@github.com:Alireza2A/SmartShoppingAssistant_Backend.git
   cd SmartShoppingAssistant_Backend
````

2. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

Environment-specific configurations are set in `.env` file. This file is not available.

Create a new `.env` file, you may add the following variable the `DATABASE_URL` ,`JWT_SECRET` and `NODE_ENV` values.

- `DATABASE_URL=URL from Neon`
- `JWT_SECRET=whatever you like as a secret key `
- `NODE_ENV=development`

## Running the Server

To start the server, run the following command:

```bash
npm run dev
```

The server will start running at [http://localhost:5001](http://localhost:5001)

## Backend

- Set up a Node.js server using the built-in http module in package.json.
  `"type": "module",`

- The sequelize package connect your PostgreSQL database.
  Variable sequelize , create new instance Sequelize. Attributes: `dialect: "postgres"`, specify the database that we use and `logging: false,`, disable SQL logging in the console

  - connectDB test database connection on startup. Print `"database connected successfully."` if client is connected or `"database connection failed", err.message` if connection do not work.

##  API Overview

| Endpoint             | Method | Description                         |
| -------------------- | ------ | ----------------------------------- |
| `/api/auth/register` | POST   | Register a new user                 |
| `/api/auth/login`    | POST   | Authenticate and return a JWT token |
| `/api/products`      | GET    | Get all available products          |
| `/api/liveData`      | POST   | Trigger live scraping by query      |
| `/api/price-alerts`  | POST   | Create a new price alert            |
| `/api/wishlist`      | GET    | Get user wishlist items             |

# Database

We use [Neon](https://console.neon.tech/) with postgresql.

Set the following queries in [Neon](https://console.neon.tech/).

# Scraper

### Amazon.com Product Scraper (with Puppeteer & Pagination)

This project is a robust web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **Amazon.com** based on a given search query. It supports **automatic pagination**, meaning it scrapes **all available result pages**, collecting key product information into a structured format.

#### 🚀 Features

- ✅ Scrapes search results from **Amazon.com**
- 🔄 Automatically paginates through all result pages
- 📦 Extracts:
  - Product title
  - Price
  - Rating
  - Image URL
  - Seller name
  - Product detail link (using ASIN)
  - Prime eligibility
  - Delivery information
  - Badge labels (e.g., "Best Seller", "Amazon’s Choice")
  - Product seller rating
  - Store label (`"Amazon"`)

##### 📥 Output Example

Here’s a sample from the `iphone` search:

`title: Apple iPhone 13 (128GB, Blue) price: $799.00 rating: 4.7 out of 5 stars link: https://www.amazon.com/dp/B09V3HN1MZ image: https://m.media-amazon.com/images/... seller: Visit the Apple Store productSellerRate: 4.7 out of 5 stars badge: Best Seller isPrime: true delivery: FREE delivery Tomorrow store: Amazon`

---

### Amazon.de Product Scraper (with Puppeteer & Pagination)

This is a powerful web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **Amazon.de** based on any search term.  
It supports **automatic pagination**, meaning it will go through all result pages and collect structured product data into a single array.

#### 🚀 Features

- ✅ Scrapes search results from **Amazon.de**
- 🔄 Automatically paginates through all result pages
- 📦 Extracts:
  - Product title
  - Price
  - Rating
  - Image URL
  - Seller name
  - Product detail link (generated via ASIN)
  - Prime eligibility
  - Delivery information
  - Badge text (e.g. "Bestseller", "Amazon’s Choice")
  - Product seller rating
  - Store label (`"Amazon"`)

##### 📥 Output Example

Here’s a sample output from the `iphone` search:

`title: Apple iPhone 13 (128 GB) - Blue price: 849,00 € rating: 4.6 out of 5 stars link: https://www.amazon.de/dp/B09V3HN1MZ image: https://m.media-amazon.com/images/... seller: Visit the Apple Store productSellerRate: 4.6 out of 5 stars badge: Bestseller isPrime: true delivery: FREE delivery tomorrow store: Amazon`

---

### eBay.com Product Scraper (with Puppeteer & Pagination)

This project is a robust web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **eBay.com** based on a given search query. It supports **automatic pagination**, meaning it scrapes **multiple pages of results**, collecting key product information into a structured format.

#### 🚀 Features

- ✅ Scrapes search results from **eBay.com**
- 🔄 Supports automatic pagination (up to a specified `maxPages`)
- 📦 Extracts:
  - Product title
  - Price
  - Image URL
  - Product detail link
  - Shipping cost (if available)
  - Item condition (e.g. New, Used)
  - Seller location
  - Store label (`"eBay"`)

##### 📥 Output Example

Here’s a sample from the `iphone` search:

`title: Apple iPhone 13 128GB - Factory Unlocked price: $589.00 link: https://www.ebay.com/itm/123456789 image: https://i.ebayimg.com/images/... condition: New shipping: Free shipping location: Miami, Florida store: eBay`

---

### eBay.de Product Scraper (with Puppeteer & Pagination)

This project is a robust web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **eBay.de** based on a given search query. It supports **automatic pagination**, meaning it scrapes **multiple result pages**, collecting key product information into a structured format.

#### 🚀 Features

- ✅ Scrapes search results from **eBay.de**
- 🔄 Automatically paginates through multiple result pages
- 📦 Extracts:
  - Product title
  - Price
  - Image URL
  - Product detail link
  - Shipping cost (if available)
  - Item condition (e.g., New, Used)
  - Seller location
  - Store label (`"eBay"`)

##### 📥 Output Example

Here’s a sample from the `iphone` search:

`title: Apple iPhone 13 128GB - Ohne Simlock - Verschiedene Farben price: 589,00 € link: https://www.ebay.de/itm/123456789 image: https://i.ebayimg.com/images/... condition: Neu shipping: Kostenloser Versand location: Berlin, Deutschland store: eBay`

---

### Newegg.com Product Scraper (with Puppeteer & Pagination)

This project is a robust web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **Newegg.com** based on a given search query. It supports **automatic pagination**, meaning it scrapes **up to 20 pages of results**, collecting key product information into a structured format.

#### 🚀 Features

- ✅ Scrapes search results from **Newegg.com**
- 🔄 Automatically paginates through multiple result pages
- 📦 Extracts:
  - Product title
  - Price
  - Rating
  - Number of reviews
  - Image URL
  - Product detail link
  - Shipping information
  - Store label (`"Newegg"`)

##### 📥 Output Example

Here’s a sample from the `iphone` search:

`title: Apple iPhone 13 128GB (Factory Unlocked) price: 799.00$ rating: 4 out of 5 reviews: 157 link: https://www.newegg.com/p/123456789 image: https://c1.neweggimages.com/... shipping: Free Shipping store: Newegg`

---

### BackMarket.com Product Scraper (with Puppeteer Extra & Stealth Plugin)

This project is a robust web scraper built with **Node.js**, **puppeteer-extra**, and the **stealth plugin**, specifically designed to extract product listings from **BackMarket.com**. It supports **query-based search** and scrapes **multiple result pages**, collecting detailed product data into a structured format.

#### 🚀 Features

- ✅ Scrapes product listings from **BackMarket.com**
- 🔎 Supports query-based searches (brand, name, storage, color, etc.)
- 🛡️ Uses `puppeteer-extra` with `stealth-plugin` to bypass bot detection
- 🔄 Automatically paginates through multiple result pages
- 📦 Extracts:
  - Product title
  - Price
  - Original price
  - Discount percentage
  - Rating
  - Storage specification
  - Image URL
  - Product detail link
  - Store label (`"Back Market"`)

##### 📥 Output Example

Here’s a sample from the `Apple iPhone 128GB white` search:

`title: Apple iPhone 13 128GB - White price: €489.00 original: €749.00 discount: 35% image: https://www.backmarket.com/image/iphone13.jpg link: https://www.backmarket.com/en-us/p/iphone-13/123456 rating: 4.5/5 storage: 128GB store: Back Market`

---

## Dependencies

- [**Express.js**](https://expressjs.com/) – A fast and minimalist Node.js web framework used to build robust RESTful APIs.
- [**pg**](https://www.npmjs.com/package/pg) – PostgreSQL client for Node.js used to communicate with the PostgreSQL database.
- [**sequelize**](https://sequelize.org/) – A powerful ORM for Node.js, simplifies database operations with models, relationships, and migrations.
- [**axios**](https://www.npmjs.com/package/axios) – A promise-based HTTP client for making API requests, often used for fetching external data or services.
- [**puppeteer**](https://pptr.dev/) – A Node.js library that provides a high-level API to control headless Chrome or Chromium for web scraping and automation.
- [**puppeteer-extra**](https://www.npmjs.com/package/puppeteer-extra) – A plugin framework built around Puppeteer to extend its capabilities, often used for stealth mode and bypassing detection.
- [**puppeteer-extra-plugin-stealth**](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth) – A plugin for `puppeteer-extra` that helps bypass bot detection by mimicking real browser behavior.
- [**cheerio**](https://cheerio.js.org/) – Fast, flexible, and lean implementation of core jQuery designed for server-side HTML manipulation and scraping.
- [**jsonwebtoken**](https://www.npmjs.com/package/jsonwebtoken) – Implements JSON Web Tokens for secure authentication and authorization in APIs.
- [**bcrypt**](https://www.npmjs.com/package/bcrypt) – A library to hash and compare passwords securely using the bcrypt algorithm.
- [**bcryptjs**](https://www.npmjs.com/package/bcryptjs) – A pure JavaScript implementation of bcrypt for environments where native modules aren’t supported.
- [**joi**](https://www.npmjs.com/package/joi) – A data validation library that helps define clear and robust validation rules for user input and API data.
- [**cors**](https://www.npmjs.com/package/cors) – A middleware to enable Cross-Origin Resource Sharing, allowing your API to be accessed from different origins.
- [**helmet**](https://helmetjs.github.io/) – Enhances your app’s security by setting various HTTP headers.
- [**body-parser**](https://www.npmjs.com/package/body-parser) – Middleware to parse incoming request bodies in a middleware before your handlers.
- [**morgan**](https://www.npmjs.com/package/morgan) – An HTTP request logger middleware for Node.js, helpful for debugging and monitoring.

## Dev Dependencies

- [**dotenv**](https://www.npmjs.com/package/dotenv) – Loads environment variables from a `.env` file into `process.env`, keeping sensitive config out of your code.
- [**nodemon**](https://nodemon.io/) – Monitors your source files and restarts the server automatically on changes, speeding up development.

# Project Resources

#### Node.js, Express, Joi & APIs

- [Node.js Official Docs](https://nodejs.org/en/docs)
- [Express.js Guide](https://expressjs.com/en/starter/guide.html)
- [REST API Tutorial](https://restfulapi.net/)
- [JOI Documentation](https://joi.dev/)
- [Postman Collections](https://learning.postman.com/docs/getting-started/first-steps/creating-the-first-collection/)

#### Web Scraping

- [Puppeteer Docs](https://pptr.dev/)
- [puppeteer-extra (npm)](https://www.npmjs.com/package/puppeteer-extra)
- [puppeteer-extra-plugin-stealth (npm)](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth)

  <!-- - [Cheerio Documentation](https://cheerio.js.org/) -->
  <!-- - [Avoiding Bot Detection](https://www.scraperapi.com/blog/how-to-avoid-bot-detection/) -->

#### Background Jobs & Queues

- [BullMQ Docs](https://docs.bullmq.io/)
- [Redis for Node.js](https://redis.io/docs/clients/node/)

#### PostgreSQL & Sequelize

- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/)

#### Real-time & Notifications

- [WebSockets Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Nodemailer Guide](https://nodemailer.com/about/)
- [Firebase Push Notifications](https://firebase.google.com/docs/cloud-messaging)
