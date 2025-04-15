# 🛍️ SmartShoppingAssistant_Backend - Project Summary: SSA

The SSA Backend is a **Node.js** + **Express.js** powered system designed to support a smart shopping assistant web application. It enables:

- 💰 Real-time product price comparisons
- 📈 Historical price tracking
- 🔔 Personalized deal notifications

It scrapes data from e-commerce sites like **Amazon**, **eBay**, **Newegg**, and **BackMarket**.

---

# 📚 Table of Contents

- 🛍️ [Project Summary](#-smartshoppingassistant_backend---project-summary-ssa)
- 👥 [Contributions](#-contributions)
- 🚀 [Deployment](#-deployment)
  - 🧠 [Backend](#-backend)
  - 🖥️ [Frontend](#-frontend)
- 🧰 [Key Technologies](#-key-technologies)
- 🗂️ [Folder Structure](#-folder-structure)
- 🧾 [Prerequisites, Installation & Configuration](#-prerequisites-installation--configuration)
- ⚙️ [Backend Details](#-backend-1)
- 🛢️ [Database Setup](#-database)
- 🔎 [Scraper Overview](#-scraper)
  - 🛒 Amazon.com Scraper
  - 🏷️ Amazon.de Scraper
  - 🌍 eBay.com Scraper
  - 🗺️ eBay.de Scraper
  - 💻 Newegg.com Scraper
  - 🧲 BackMarket.com Scraper
- 🔌 [API Endpoints](#-api-endpoints-overview)
- 📦 [Dependencies](#-dependencies)
- 🧪 [Dev Dependencies](#-dev-dependencies)
- 📚 [Project Resources](#-project-resources)

---

### 👥 Contributions

- 👩‍💻 [Mounika](https://github.com/Mounika-Nanjala)
- 👩‍💻 [Rajvi](https://github.com/rajvikmadhani)
- 👨‍💻 [Alireza](https://github.com/Alireza2A)
- 👨‍💻 [Andrei](https://github.com/raizy21)

_Are maintainers for this repository._

---

## 🚀 Deployment

### 🧠 Backend

**📦 GitHub Repository**:  
🔗 [https://github.com/Alireza2A/SmartShoppingAssistant_Backend](https://github.com/Alireza2A/SmartShoppingAssistant_Backend)

🌍 **Live Backend (Render)**:  
🔗 [https://smartshoppingassistant-backend.onrender.com/](https://smartshoppingassistant-backend.onrender.com/)

🧪 API routes available from this domain include:  
`/api/auth`, `/api/products`, `/api/liveData`, `/api/notifications`, `/api/price-alerts`, `/api/scrapingJob`, `/api/coupons`, `/api/wishlist`, `/api/users`

---

### 🖥️ Frontend

**📦 GitHub Repository**:  
🔗 [https://github.com/rajvikmadhani/SmartShoppingAssistant_Frontend](https://github.com/rajvikmadhani/SmartShoppingAssistant_Frontend)

🌍 **Live Frontend**:  
🔗 [https://smartshoppingassistant-frontend.onrender.com/](https://smartshoppingassistant-frontend.onrender.com/)

---

# 🧰 Key Technologies

- ⚙️ **Backend**: Node.js + Express.js
- 🗃️ **Database**: PostgreSQL (hosted on Neon)
- 🕷️ **Web Scraping**: Puppeteer
- ⏱️ **Background Jobs**: BullMQ + Redis
- 🔄 **Real-time Updates**: WebSockets / Polling
- 📬 **Notifications**: Email (Nodemailer) & Push (Firebase)

---

## 🗂️ Folder Structure

```bash
SmartShoppingAssistant_Backend/
├── 📄 .gitignore               # Files and folders to ignore in Git
├── 📄 README.md                # Project documentation and overview
├── ⚙️ babel.config.js          # Babel configuration for transforming modern JS
├── ⚙️ jest.config.js           # Jest configuration for running tests
├── 📦 package.json             # Project metadata, dependencies, and scripts
├── 📦 package-lock.json        # Ensures consistent installs across environments

└── 📁 src/                     # Main source code directory
    ├── ⚙️ config/              # App configuration (DB, Redis, BullMQ, etc.)
    ├── 🧠 controllers/         # Route controllers — request handlers
    ├── 🗃️ db/                  # DB init files, connection logic, seeders
    ├── 🧩 middleware/          # Express middleware (auth, validation, error handling)
    ├── 🧬 models/              # Sequelize models — define DB schema
    ├── 🛣️ routes/              # API route definitions and modular route files
    ├── 📜 schemas/             # Joi validation schemas for request validation
    ├── 🛠️ services/            # Business logic and services (scrapers, notifications, etc.)
    ├── 🧪 test/                # Unit and integration test files
    ├── 🔧 utils/               # Utility functions and helpers
    └── 🚀 server.js            # Main Express app entry point

```

===

## 🧰 Prerequisites

Before running this server, ensure you have the following installed:

- 🟢 [nodejs](https://nodejs.org/)
- 📦 [npm](https://www.npmjs.com/)

---

## 📥 Installation

1. 📂 Clone the repository:

   ```bash
   git@github.com:Alireza2A/SmartShoppingAssistant_Backend.git
   cd SmartShoppingAssistant_Backend
   ```

2. 📦 Install dependencies:

   ```bash
   npm install
   ```

## ⚙️ Configuration

Environment-specific configurations are set in `.env` file. This file is not available.

🛠️ Create a new `.env` file, you may add the following variable the `DATABASE_URL` ,`JWT_SECRET` and `NODE_ENV` values.

- `DATABASE_URL=URL from Neon`
- `JWT_SECRET=whatever you like as a secret key `
- `NODE_ENV=development`

## 🚀 Running the Server

To start the server, run the following command:

```bash
npm run dev
```

🌐 The server will start running at [http://localhost:5001](http://localhost:5001)

## 🧠 Backend

- 🏗️ Set up a Node.js server using the built-in `http` module in `package.json`.
  `"type": "module",`

- 🛢️ The `sequelize` package connects your PostgreSQL database.
  🧬 Create a new instance of `Sequelize` with attributes like:

  - `dialect: "postgres"` to specify the database type
  - `logging: false` to disable SQL logging in the console

- 🔌 `connectDB` tests the database connection on startup:
  - ✅ Logs `"database connected successfully."` if successful
  - ❌ Logs `"database connection failed", err.message` if it fails

## 📡 API Endpoints Overview

This section outlines the available backend API routes for the SmartShoppingAssistant project. These endpoints support key functionalities such as fetching products, searching in real-time, user authentication, profile management, wishlist actions, and price tracking.

---

### 🛒 Product Endpoints

#### 📦 Fetch All Products

- **GET** `/api/products`  
  Returns all products from the **database only**.

#### 🔍 Search Products (Live Scrape or DB)

- **GET** `/api/liveData/?name=iPhone&brand=Apple`  
  Searches a product by query. May return results from the **database** or **scraped live** from external sources depending on availability.

#### 💸 Best Price Products (Homepage)

- **GET** `/api/products/best-prices`  
  Returns a selection of products with the **best available prices** for homepage display.

---

### 👤 Authentication & User

#### 📝 Register a New User

- **POST** `/api/auth/register`  
  **Body Parameters:**  
  Required: `name`, `email`, `password`  
  Optional: `surname`, `street`, `city`, `zipcode`, `about`, `phone`

#### 🔐 Login

- **POST** `/api/auth/login`  
  **Body Parameters:**  
  Required: `email`, `password`

#### 🧾 User Profile (Get & Update)

- **GET** `/api/users/profile`  
  Returns the logged-in user's profile.
- **PUT** `/api/users/profile`  
  **Body Parameters:** _(All optional)_  
  `name`, `surname`, `email`, `street`, `city`, `zipcode`, `about`, `phone`

---

### 💖 Wishlist

#### 📃 View Wishlist

- **GET** `/api/wishlist`  
  Returns all wishlist items for the current user.

#### ➕ Add to Wishlist

- **POST** `/api/wishlist`  
  **Body Parameters:**  
  Required: `productId`, `priceId`  
  Optional: `note`

#### 📝 Update Wishlist Note

- **PUT** `/api/wishlist/:id`  
  **Body Parameters:**  
  Required: `note`

#### ❌ Remove from Wishlist

- **DELETE** `/api/wishlist/:id`  
  Deletes a wishlist item by ID.

---

### 📈 Price History

#### 📉 Get Product Price Chart

- **GET** `/api/price-history/chart/:productId?ram=128&storage=512&color=blue`  
  Returns time-series data points:  
  `{ label: <Date>, value: <price> }`

#### 📊 Get Raw Price History

- **GET** `/api/price-history/:productId?storage=512`  
  **Query Parameters:**
  - Required: `productId`, `storage`
  - Optional: `ram`, `color`
  ***

### 🔔 Notifications

#### 📬 Mark Notification as Read

- **PUT** `/api/notification/:notificationId/read`  
  Marks the notification as **read**.  
  🔧 Call this endpoint **when the user opens or reads a notification**.

---

# 🗃️ Database

We use [🌐 Neon](https://console.neon.tech/) with **PostgreSQL**.

🛠️ We have the following tables in [Neon Console](https://console.neon.tech/).

---

## 🗄️ Database Overview – 💾 Core Data Structure

Our backend relies on a well-structured relational database built with **PostgreSQL**, enabling robust product tracking, price comparisons, user personalization, and background scraping operations.

Each table in the schema plays a specific role in the system. Below is a description of the primary tables:

- 🏷️ **Coupons** – Stores discount codes and promotions tied to sellers and stores.
- 🔔 **Notifications** – Captures messages, alerts, and updates shown to users in real-time.
- 🛎️ **PriceAlerts** – Tracks user-defined alerts for specific price or availability changes.
- 💰 **Prices** – Holds product pricing, stock info, and historical trends per seller/store.
- 🛍️ **Products** – Catalog of available products across all platforms with base attributes.
- 🛠️ **ScrapingJobs** – Logs each scraping task, its status, and result metadata.
- 🏪 **SellerStores** – Connects sellers to the marketplaces they list on.
- 👤 **Users** – Stores user profile data and preferences.
- ❤️ **Wishlists** – Tracks user-saved products for future deals or alerts.
- 🧑‍💼 **Sellers** – Contains merchant information such as contact and store links.
- 🏬 **Stores** – Represents e-commerce platforms like Amazon, eBay, Newegg, etc.

Each table is interlinked to power real-time price discovery, deal alerts, scraping tasks, and user interaction — forming the **data backbone** of the Smart Shopping Assistant.

> 📊 _Designed for flexibility and scalability, this schema makes it easy to extend across multiple stores, users, and price tracking tools._

## 🧾 Coupons Table – 💸 Store Discounts & Promotions

This table stores promotional discount codes offered by sellers across different e-commerce stores. Each coupon is linked to a store and seller store, with details on discount value, expiration, and activation status.

| 🔑 Column Name     | 🗃️ Type   | 📌 Description                              |
| ------------------ | --------- | ------------------------------------------- |
| 🆔 `id`            | Integer   | Primary key, unique identifier              |
| 🏬 `storeId`       | Integer   | Reference to the associated store           |
| 🎟️ `code`          | String    | Coupon code entered by the user             |
| 💸 `discount`      | Decimal   | Discount value (percentage or flat amount)  |
| 📆 `expiryDate`    | Date      | Date the coupon expires                     |
| ✅ `isActive`      | Boolean   | Indicates if the coupon is currently usable |
| 🕒 `createdAt`     | Timestamp | When the coupon was created                 |
| 🕒 `updatedAt`     | Timestamp | Last modification time of the coupon        |
| 🛍️ `sellerStoreId` | Integer   | Foreign key linking to a seller's store     |
| 🔗 `SellerStore`   | Object    | Relationship to the SellerStore model       |

> 💡 _This table helps manage time-sensitive coupon campaigns tied to specific stores and sellers._

## 🔔 Notifications Table – 📬 User Alerts & Updates

This table keeps track of messages and system alerts sent to users. Notifications can inform users about price changes, wishlist updates, coupon expirations, and more. Each notification is tied to a specific user and includes read status.

| 🔑 Column Name | 🗃️ Type   | 📌 Description                                    |
| -------------- | --------- | ------------------------------------------------- |
| 🆔 `id`        | Integer   | Primary key, unique identifier                    |
| 🙍 `userId`    | Integer   | Foreign key referencing the target user           |
| 🏷️ `type`      | String    | Type of notification (e.g., "priceDrop", "alert") |
| 💬 `message`   | Text      | The message content shown to the user             |
| 📥 `isRead`    | Boolean   | Whether the user has seen the notification        |
| 🕒 `createdAt` | Timestamp | Timestamp when notification was created           |
| 🕒 `updatedAt` | Timestamp | Last time the notification was updated            |
| 🔗 `User`      | Object    | Association with the `User` model                 |

> 💡 _Useful for notifying users of important events and personalized triggers in real-time._

## 📢 PriceAlerts Table – 🔔 Track Desired Price Changes

The `PriceAlerts` table stores user-defined alerts for specific product prices. When a price falls below a threshold or changes in availability, the system can notify users using this table as a reference.

| 🔑 Column Name    | 🗃️ Type   | 📌 Description                                        |
| ----------------- | --------- | ----------------------------------------------------- |
| 🆔 `id`           | Integer   | Primary key, unique identifier                        |
| 🔗 `priceId`      | Integer   | Foreign key linking to the `Prices` table             |
| 💱 `currency`     | String    | Currency format (e.g., $, €)                          |
| 📦 `availability` | Boolean   | Availability status of the product                    |
| 💰 `price`        | Decimal   | Current price when alert was triggered                |
| 🕒 `recordedAt`   | Timestamp | Time the alert data was captured                      |
| 🕒 `createdAt`    | Timestamp | Alert creation timestamp                              |
| 🕒 `updatedAt`    | Timestamp | Last time alert record was updated                    |
| 🔗 `Price`        | Object    | Association with the `Prices` model for detailed info |

> 🧠 _Used to trigger user notifications when product prices meet alert conditions._

## 💸 Prices Table – 🏷️ Product Listings with Seller & Trend Data

The `Prices` table contains detailed product pricing, technical specifications, seller information, and historical tracking. It’s essential for comparing prices across different stores and tracking trends over time.

| 🔑 Column Name            | 🗃️ Type   | 📌 Description                                     |
| ------------------------- | --------- | -------------------------------------------------- |
| 🆔 `id`                   | Integer   | Primary key, unique identifier                     |
| 🔗 `productId`            | Integer   | Foreign key referencing the `Products` table       |
| 🖼️ `mainImgUrl`           | String    | URL of the product’s main image                    |
| 🎨 `color`                | String    | Color of the product                               |
| 💾 `ram_gb`               | Integer   | Amount of RAM in GB                                |
| 💽 `storage_gb`           | Integer   | Internal storage size in GB                        |
| 🏬 `sellerStoreId`        | Integer   | Foreign key referencing the `SellerStores` table   |
| 🔗 `product_link`         | String    | URL to the original product listing                |
| 💰 `price`                | Decimal   | Current price of the product                       |
| 💱 `currency`             | String    | Currency code (e.g., USD, EUR)                     |
| 📦 `availability`         | Boolean   | Whether the product is in stock                    |
| 🚚 `shippingCost`         | Decimal   | Shipping cost (if applicable)                      |
| 🎁 `discount`             | Decimal   | Discount amount or percentage                      |
| 🕒 `lastUpdated`          | Timestamp | Timestamp of the most recent price update          |
| 🕒 `createdAt`            | Timestamp | When this price record was created                 |
| 🕒 `updatedAt`            | Timestamp | When this price record was last updated            |
| ⭐ `product_rating`       | Decimal   | Average rating for this specific listing           |
| 📈 `productHistories`     | Object    | Array of price history entries over time           |
| 🔗 `Product`              | Object    | Association with the related `Product` entity      |
| 🔗 `SellerStore`          | Object    | Association with the `SellerStore` entity          |
| 📌 `id_Wishlists_priceId` | Array     | Reference IDs for wishlists using this price entry |

> 💡 _Central hub for pricing intelligence, powering alerts, wishlists, and comparison features._

## 🛍️ Products Table – 🧾 Master Catalog of Items

The `Products` table serves as the core inventory of all items tracked within the Smart Shopping Assistant. It contains essential product information such as name, description, and brand, and acts as a reference for prices, alerts, jobs, and wishlists.

| 🔑 Column Name                 | 🗃️ Type   | 📌 Description                                        |
| ------------------------------ | --------- | ----------------------------------------------------- |
| 🆔 `id`                        | Integer   | Primary key, unique identifier                        |
| 🏷️ `name`                      | String    | Product name (e.g., "iPhone 13")                      |
| 📝 `description`               | Text      | Brief description of the product                      |
| 🏢 `brand`                     | String    | Manufacturer or brand name (e.g., Apple, Samsung)     |
| 🕒 `createdAt`                 | Timestamp | When this product record was created                  |
| 🕒 `updatedAt`                 | Timestamp | When this product record was last modified            |
| 🔗 `id_PriceAlerts_productId`  | Array     | Linked price alerts for this product                  |
| 🔗 `id_Prices_productId`       | Array     | Associated prices from different stores               |
| 🔗 `id_ScrapingJobs_productId` | Array     | Jobs scheduled or completed for scraping this product |
| 🔗 `id_Wishlists_productId`    | Array     | Wishlists that include this product                   |

> 🧠 _Acts as the foundation of the product ecosystem, enabling price tracking, user alerts, scraping tasks, and wishlist functionality._

## 🧹 ScrapingJobs Table – 🤖 Automated Data Fetching Tasks

The `ScrapingJobs` table logs all scraping tasks initiated to fetch product data from various stores. Each job includes metadata such as status, timing, error logs, and references to the associated product and store.

| 🔑 Column Name    | 🗃️ Type   | 📌 Description                                            |
| ----------------- | --------- | --------------------------------------------------------- |
| 🆔 `id`           | Integer   | Primary key, unique identifier                            |
| 📦 `productId`    | Integer   | Foreign key linking to the `Products` table               |
| 🏬 `storeId`      | Integer   | Foreign key linking to the `Stores` table                 |
| 🔄 `status`       | String    | Status of the job (e.g., "pending", "completed", "error") |
| 🕓 `startedAt`    | Timestamp | When the scraping job started                             |
| 🕓 `completedAt`  | Timestamp | When the scraping job completed                           |
| ❗ `errorMessage` | Text      | Optional error message if the job failed                  |
| 🕒 `createdAt`    | Timestamp | Record creation timestamp                                 |
| 🕒 `updatedAt`    | Timestamp | Record last updated timestamp                             |
| 🔗 `Product`      | Object    | Association with the `Product` entity                     |
| 🔗 `Store`        | Object    | Association with the `Store` entity                       |

> ⚙️ _Essential for orchestrating and monitoring automated scraping routines across platforms._

## 🏪 SellerStores Table – 🧾 Link Between Sellers & Stores

The `SellerStores` table represents the relationship between sellers and the platforms they operate on (e.g., Amazon, eBay). It contains metadata like rating and connects coupons and prices for each seller-store pairing.

| 🔑 Column Name               | 🗃️ Type  | 📌 Description                                           |
| ---------------------------- | -------- | -------------------------------------------------------- |
| 🆔 `id`                      | Integer  | Primary key, unique identifier                           |
| 🙋 `sellerId`                | Integer  | Foreign key linking to the `Sellers` table               |
| 🏬 `storeId`                 | Integer  | Foreign key linking to the `Stores` table                |
| ⭐ `rating`                  | Decimal  | Seller's rating on the associated store platform         |
| 🎟️ `Cupons`                  | Object[] | Associated discount coupons offered by this seller-store |
| 💰 `id_Prices_sellerStoreId` | Object[] | List of price records tied to this seller-store          |
| 🔗 `seller`                  | Object   | Relation to the `Seller` entity                          |
| 🔗 `store`                   | Object   | Relation to the `Store` entity                           |

> 🛍️ _Helps associate sellers with their storefronts across multiple platforms and tracks their offerings._

## 👤 Users Table – 🙍‍♂️ Registered Application Users

The `Users` table stores the personal and contact details of each registered user. It also serves as the central point for linking notifications, price alerts, and wishlist data related to individual users.

| 🔑 Column Name             | 🗃️ Type   | 📌 Description                                   |
| -------------------------- | --------- | ------------------------------------------------ |
| 🆔 `id`                    | Integer   | Primary key, unique identifier                   |
| 🧑 `name`                  | String    | First name of the user                           |
| 🧑‍🦱 `surname`               | String    | Last name of the user                            |
| 📧 `email`                 | String    | Unique user email for authentication             |
| 🔒 `password`              | String    | Hashed password used for login                   |
| 🏠 `street`                | String    | User's street address                            |
| 🏙️ `city`                  | String    | User's city                                      |
| 🏷️ `zipcode`               | String    | Postal/ZIP code                                  |
| 📝 `about`                 | Text      | Short bio or about section for the user          |
| ☎️ `phone`                 | String    | Contact phone number                             |
| 🕒 `createdAt`             | Timestamp | Time the user record was created                 |
| 🕒 `updatedAt`             | Timestamp | Time the user record was last modified           |
| 🔔 `Notifications`         | Object[]  | List of notification objects related to the user |
| 🔗 `id_PriceAlerts_userId` | Object[]  | Price alerts associated with the user            |
| 🧾 `id_Wishlists_userId`   | Object[]  | Wishlist entries linked to this user             |

> 🧠 _Central to managing authentication, personalization, and user-based alerting systems._

## ❤️ Wishlists Table – 📝 User-Saved Products

The `Wishlists` table stores products that users have favorited or saved for future reference. It links users to specific product and price combinations and supports optional user notes.

| 🔑 Column Name | 🗃️ Type   | 📌 Description                                               |
| -------------- | --------- | ------------------------------------------------------------ |
| 🆔 `id`        | Integer   | Primary key, unique identifier                               |
| 🙍 `userId`    | Integer   | Foreign key referencing the user who owns this wishlist item |
| 📦 `productId` | Integer   | Foreign key referencing the product                          |
| 💰 `priceId`   | Integer   | Foreign key referencing the specific price version           |
| 📝 `note`      | Text      | Optional user-added comment or note                          |
| 🕒 `createdAt` | Timestamp | Timestamp when the wishlist item was created                 |
| 🕒 `updatedAt` | Timestamp | Last time the wishlist item was modified                     |
| 🔗 `Price`     | Object    | Linked price object for historical or current price info     |
| 🔗 `Product`   | Object    | Linked product object for display details                    |
| 🔗 `User`      | Object    | Association with the `User` who saved the item               |

> 💡 _Empowers users to track product availability, price changes, and receive notifications for saved items._

## 🧑‍💼 Sellers Table – 🏪 Vendor Information

The `Sellers` table contains information about individual vendors who list products on the platform. This includes their identity, contact details, and associations with the stores they operate in.

| 🔑 Column Name                | 🗃️ Type   | 📌 Description                                    |
| ----------------------------- | --------- | ------------------------------------------------- |
| 🆔 `id`                       | Integer   | Primary key, unique identifier                    |
| 🧾 `name`                     | String    | Seller's official name                            |
| 📞 `contact_info`             | String    | Contact information such as phone or email        |
| 🕒 `createdAt`                | Timestamp | Timestamp when the seller record was created      |
| 🕒 `updatedAt`                | Timestamp | Timestamp when the seller record was last updated |
| 🔗 `id_SellerStores_sellerId` | Array     | List of store records associated with this seller |

> 🛍️ _Essential for linking stores, prices, and product listings to real-world sellers._

## 🏬 Stores Table – 🌐 Online Retail Platforms

The `Stores` table contains metadata about various e-commerce platforms from which products are scraped. This includes store identity, site URL, and references to associated scraping jobs and sellers.

| 🔑 Column Name               | 🗃️ Type   | 📌 Description                                          |
| ---------------------------- | --------- | ------------------------------------------------------- |
| 🆔 `id`                      | Integer   | Primary key, unique identifier for the store            |
| 🏷️ `name`                    | String    | Name of the e-commerce platform (e.g., Amazon, eBay)    |
| 🌍 `website`                 | String    | Official URL of the store                               |
| 🕒 `createdAt`               | Timestamp | Timestamp when the store entry was created              |
| 🕒 `updatedAt`               | Timestamp | Timestamp when the store entry was last updated         |
| 🔗 `id_ScrapingJobs_storeId` | Array     | Associated scraping jobs initiated for this store       |
| 🔗 `id_SellerStores_storeId` | Array     | Associations to seller-store mappings for this platform |

> 🧩 _Acts as the source registry for scraping jobs, seller mapping, and store-specific product logic._

---

# 🔎 Scraper

### 🛍️ Amazon.com Product Scraper – 🇺🇸 Powered by Puppeteer & Pagination

A high-performance web scraper built using **Node.js** and **Puppeteer** to extract product listings from **Amazon.com**. It features pagination support and structured data output ready for smart shopping systems.

#### 🚀 Key Features

- ✅ Scrapes product listings from **Amazon.com**
- 🌐 Uses a real **user-agent** to simulate human browsing
- 🔁 Supports pagination up to a user-defined `maxPages`
- 🧠 Extracts detailed product information:
  - 🏷️ **Title**
  - 💰 **Price**
  - 💱 **Currency**
  - ⭐ **Rating**
  - 🏪 **Seller**
  - 📦 **Availability** (e.g., in stock or out of stock)
  - 🛡️ **Prime eligibility**
  - 🚚 **Delivery info**
  - 🏅 **Badge** (e.g., Amazon’s Choice)
  - 🔗 **Product detail link (ASIN-based)**
  - 🖼️ **Product image**
  - 🛍️ **Store label** ("Amazon")

#### 📥 Example Output

Sample output for a search query like `iphone`:

```json
{
  "title": "Apple iPhone 13 (128GB, Blue)",
  "price": 799.0,
  "currency": "$",
  "brand": "Unknown",
  "availability": "in_stock",
  "storage_gb": 0,
  "ram_gb": 0,
  "rating": "4.7 out of 5 stars",
  "shippingCost": 0,
  "discount": 0,
  "link": "https://www.amazon.com/dp/B09V3HN1MZ",
  "image": "https://m.media-amazon.com/images/I/71...jpg",
  "seller": "Amazon.com",
  "productSellerRate": 0,
  "badge": "Amazon's Choice",
  "isPrime": true,
  "delivery": "Free delivery Tomorrow",
  "store": "Amazon",
  "seller_rating": 0
}
```

---

### 🛍️ Amazon.de Product Scraper – 🇩🇪 Built with Puppeteer & Pagination

A powerful, feature-rich scraper built using **Node.js** and **Puppeteer** to extract structured product data from **Amazon.de**. It handles everything from cookies to brand detection and delivers clean, enriched results.

#### 🚀 Key Features

- ✅ Scrapes product listings from **Amazon.de**
- 🍪 Handles cookie prompts automatically
- 🔁 Supports full pagination across multiple result pages
- 🧠 Intelligent field extraction & normalization:
  - 🏷️ **Title**
  - 💰 **Price**
  - 💱 **Currency**
  - ⭐ **Rating**
  - 🏪 **Seller**
  - 🛍️ **Store label** ("Amazon")
  - 🛡️ **Prime eligibility**
  - 🚚 **Shipping cost** detection
  - 🏷️ **Discount** calculation
  - 📦 **Availability** check
  - 💾 **RAM & Storage** parsing
  - 🏅 **Badge** (e.g., Bestseller)
  - 📦 **Delivery info**
  - 🔗 **Product link** (ASIN-based)
  - 🖼️ **Product image**
  - 🔤 **Brand** guessing from title/details

#### 📥 Example Output

Sample result for the search query `iphone`:

```json
{
  "title": "Apple iPhone 13 (128GB, Blue)",
  "price": "849.00",
  "currency": "€",
  "brand": "Apple",
  "availability": "1",
  "storage_gb": 128,
  "ram_gb": null,
  "rating": "4.6 out of 5 stars",
  "shippingCost": "0.00",
  "discount": "30.00",
  "link": "https://www.amazon.de/dp/B09V3HN1MZ",
  "image": "https://m.media-amazon.com/images/I/71...jpg",
  "seller": "Apple Store",
  "productSellerRate": "4.6 out of 5 stars",
  "badge": "Bestseller",
  "isPrime": true,
  "delivery": "Gratis Lieferung morgen",
  "store": "Amazon",
  "seller_rating": "4.6 out of 5 stars"
}
```

---

### 🌍 eBay.com Product Scraper (with Puppeteer & Pagination)

This is a robust web scraper built with **Node.js** and **Puppeteer** that extracts product listings from **eBay.com** based on any search query. It supports **automatic pagination**, **dynamic image handling**, and provides a rich dataset for each product result.

#### 🚀 Features

- ✅ Scrapes search results from **eBay.com**
- 🔄 Automatically paginates through multiple result pages
- 📦 Extracts detailed product data including:
  - Product title
  - Price & currency
  - Condition & availability
  - Product image (handles lazy loading)
  - Shipping cost
  - Seller info & location
  - Delivery time
  - Badge (e.g. "Top Rated")
  - Product link (deep URL)
  - Store label (`"eBay"`)

#### 📥 Output Example

Each scraped product item has the following structure:

```json
{
  "title": "Apple iPhone 13 128GB - Factory Unlocked",
  "price": "$589.00",
  "link": "https://www.ebay.com/itm/123456789",
  "image": "https://i.ebayimg.com/images/...",
  "currency": "$",
  "brand": "Unknown",
  "availability": true,
  "storage_gb": 128,
  "ram_gb": 0,
  "ramMatch": 0,
  "rating": "N/A",
  "shippingCost": "Free Shipping",
  "discount": 0,
  "seller": "eBay",
  "productSellerRate": 0,
  "badge": "Unknown",
  "isPrime": false,
  "delivery": "Free delivery",
  "store": "eBay",
  "seller_rating": 0
}
```

---

### 🛒 eBay.de Product Scraper – 🇩🇪 (with Puppeteer & Pagination)

This advanced web scraper is built with **Node.js** and **Puppeteer** for extracting structured product data from **eBay.de** search results. It supports **automatic pagination**, **lazy-loaded image handling**, and returns detailed item data in a consistent format.

---

#### 🚀 Features

- 🔍 Scrapes real-time search results from **eBay.de**
- 🔄 Automatically paginates through multiple result pages
- 📦 Collects high-quality structured data:
  - 🏷️ Product title
  - 💰 Price (with currency)
  - 🚚 Shipping cost
  - 🆕 Condition (e.g., Neu, Gebraucht)
  - 🌍 Seller location
  - 🖼️ Product image (supports lazy-loaded or `<noscript>` fallbacks)
  - 🔗 Product URL
  - 🛒 Seller name
  - 🛍️ Store source (always "eBay")

---

#### 📥 Example Output Format

Each item returned has the following structure:

```json
{
  "title": "Apple iPhone 13 128GB - Ohne Simlock - Verschiedene Farben",
  "price": "589,00 €",
  "currency": "€",
  "brand": "Unknown",
  "availability": true,
  "storage_gb": 128,
  "ram_gb": 0,
  "ramMatch": 0,
  "rating": "N/A",
  "shippingCost": "Kostenloser Versand",
  "discount": 0,
  "link": "https://www.ebay.de/itm/123456789",
  "image": "https://i.ebayimg.com/images/...",
  "seller": "eBay",
  "productSellerRate": 0,
  "badge": "Unknown",
  "isPrime": false,
  "delivery": "Free delivery",
  "store": "eBay",
  "seller_rating": 0
}
```

---

### 💻 Newegg.com Product Scraper – 🇺🇸 (with Puppeteer & Pagination)

This scraper extracts structured product data from **Newegg.com** search results. Built with **Node.js** and **Puppeteer**, it supports **multi-page scraping**, and returns cleaned product listings with rich metadata.

---

#### 🚀 Features

- 🔍 Real-time search scraping from **Newegg.com**
- 🔄 Pagination support for up to **20 pages**
- 🖼️ Supports image lazy-loading detection
- 📦 Extracts detailed product information:
  - 🏷️ Product title
  - 💰 Price (formatted)
  - 📦 Shipping cost
  - ⭐ Rating (from tooltips)
  - 🖼️ Product image (with fallback handling)
  - 🔗 Product link
  - 🛍️ Marketplace ("Newegg")

---

#### 📥 Example Output Format

Each product result is structured like this:

```json
{
  "title": "AMD Ryzen 7 5800X3D Processor",
  "price": "329.99",
  "currency": "$",
  "brand": "Unknown",
  "availability": true,
  "storage_gb": 128,
  "ram_gb": 0,
  "ramMatch": 0,
  "rating": "5 out of 5 eggs",
  "shippingCost": "Free Shipping",
  "discount": 0,
  "link": "https://www.newegg.com/p/N82E16819113756",
  "image": "https://c1.neweggimages.com/ProductImageCompressAll1280/19-113-756-01.jpg",
  "seller": "Newegg",
  "productSellerRate": 0,
  "badge": "Unknown",
  "isPrime": false,
  "delivery": "Free delivery",
  "store": "Newegg",
  "seller_rating": 0
}
```

---

### 🧲 BackMarket.de Product Scraper – 🇩🇪 (Puppeteer Extra + Stealth Plugin)

This advanced scraper extracts product listings from **BackMarket.de** using **Puppeteer Extra** with the **Stealth Plugin** to avoid detection. It supports **multi-page scraping**, handles **lazy-loaded images**, and retrieves detailed product data from the German marketplace.

---

#### 🚀 Features

- 🔐 Stealth-enabled Puppeteer for bypassing bot detection
- 🔄 Supports pagination for scraping multiple result pages
- 🔎 Extracts full structured product metadata
- 📦 Extracts:
  - 🏷️ Product title
  - 💰 Price & Discount
  - 🖼️ Image URL (with fallback from `srcset`)
  - 🔗 Product detail page link
  - ⭐ Rating
  - 💾 Storage size (if found)
  - 🛍️ Marketplace: `"Back Market"`

---

#### 📥 Output Sample

Each scraped product follows this format:

```json
{
  "title": "Apple iPhone 13 - 128 GB - Blue",
  "price": "499.99",
  "currency": "€",
  "brand": "Unknown",
  "availability": true,
  "storage_gb": "128 GB",
  "ram_gb": 0,
  "ramMatch": 0,
  "rating": "4.5/5",
  "shippingCost": 0,
  "discount": 30,
  "link": "https://www.backmarket.de/de-de/p/iphone-13/12345",
  "image": "https://www.backmarket.de/cdn-cgi/image/w=320,q=90/...jpg",
  "seller": "Back Market",
  "productSellerRate": 0,
  "badge": "Unknown",
  "isPrime": false,
  "delivery": "Free delivery",
  "store": "Back Market",
  "seller_rating": 0
}
```

---

### 🛒 Otto.de Product Scraper – 🇩🇪 Powered by Puppeteer Extra + Stealth

This powerful web scraper extracts product listings from **Otto.de** with enhanced support for dynamic product grids. It uses **Puppeteer Extra + Stealth Plugin** for anti-bot evasion and loads all available products using custom scrolling utilities.

---

#### 🚀 Features

- 🛡️ Uses stealth plugin to bypass bot detection
- 🔄 Automatically scrolls to load **all available products**
- 🧠 Handles multiple tile selectors and dynamic class names
- 📦 Extracts:
  - 🏷️ Title
  - 💶 Price
  - 🖼️ Product Image
  - 🔗 Product Link
  - ✅ Availability
  - 🚚 Shipping Cost
  - 💸 Discount (%)
  - 📦 Delivery Info
  - 🛍️ Store name (`"Otto"`)

---

#### 📥 Output Example

Each product object looks like this:

```json
{
  "title": "Apple iPhone 15 Pro 128 GB",
  "price": "1199.00",
  "currency": "€",
  "brand": "Unknown",
  "availability": "In Stock",
  "storage_gb": 0,
  "ram_gb": 0,
  "ramMatch": 0,
  "rating": null,
  "shippingCost": "0.00",
  "discount": 10,
  "link": "https://www.otto.de/p/iphone-15/...",
  "image": "https://i.otto.de/asset/...jpg",
  "seller": "Otto",
  "productSellerRate": 0,
  "badge": "Unknown",
  "isPrime": false,
  "delivery": "Free delivery",
  "store": "Otto",
  "seller_rating": 0
}
```

---

## 📦 Dependencies

- [**Express.js**](https://expressjs.com/) – ⚙️ A fast and minimalist Node.js web framework used to build robust RESTful APIs.
- [**pg**](https://www.npmjs.com/package/pg) – 🗃️ PostgreSQL client for Node.js used to communicate with the PostgreSQL database.
- [**sequelize**](https://sequelize.org/) – 🧬 A powerful ORM for Node.js, simplifies database operations with models, relationships, and migrations.
- [**axios**](https://www.npmjs.com/package/axios) – 🌐 A promise-based HTTP client for making API requests, often used for fetching external data or services.
- [**puppeteer**](https://pptr.dev/) – 🕷️ A Node.js library that provides a high-level API to control headless Chrome or Chromium for web scraping and automation.
- [**puppeteer-extra**](https://www.npmjs.com/package/puppeteer-extra) – 🛡️ A plugin framework built around Puppeteer to extend its capabilities, often used for stealth mode and bypassing detection.
- [**puppeteer-extra-plugin-stealth**](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth) – 🕵️ A plugin for `puppeteer-extra` that helps bypass bot detection by mimicking real browser behavior.
- [**cheerio**](https://cheerio.js.org/) – 🍃 Fast, flexible, and lean implementation of core jQuery designed for server-side HTML manipulation and scraping.
- [**jsonwebtoken**](https://www.npmjs.com/package/jsonwebtoken) – 🔐 Implements JSON Web Tokens for secure authentication and authorization in APIs.
- [**bcrypt**](https://www.npmjs.com/package/bcrypt) – 🔒 A library to hash and compare passwords securely using the bcrypt algorithm.
- [**bcryptjs**](https://www.npmjs.com/package/bcryptjs) – 🔐 A pure JavaScript implementation of bcrypt for environments where native modules aren’t supported.
- [**joi**](https://www.npmjs.com/package/joi) – ✅ A data validation library that helps define clear and robust validation rules for user input and API data.
- [**cors**](https://www.npmjs.com/package/cors) – 🌍 A middleware to enable Cross-Origin Resource Sharing, allowing your API to be accessed from different origins.
- [**helmet**](https://helmetjs.github.io/) – 🛡️ Enhances your app’s security by setting various HTTP headers.
- [**body-parser**](https://www.npmjs.com/package/body-parser) – 🧾 Middleware to parse incoming request bodies in a middleware before your handlers.
- [**morgan**](https://www.npmjs.com/package/morgan) – 📋 An HTTP request logger middleware for Node.js, helpful for debugging and monitoring.

## 🧪 Dev Dependencies

- [**dotenv**](https://www.npmjs.com/package/dotenv) – 🌱 Loads environment variables from a `.env` file into `process.env`, keeping sensitive config out of your code.
- [**nodemon**](https://nodemon.io/) – 🔁 Monitors your source files and restarts the server automatically on changes, speeding up development.
- [**jest**](https://jestjs.io/) – 🧪 A delightful JavaScript testing framework with built-in assertion, mocking, snapshot testing, and more.
- [**supertest**](https://www.npmjs.com/package/supertest) – 🌐 A high-level abstraction for testing HTTP endpoints in Node.js apps, ideal for Express APIs.
- [**babel-jest**](https://www.npmjs.com/package/babel-jest) – 🧬 A Jest transformer that allows using Babel to preprocess your tests written in modern JavaScript.
- [**@babel/preset-env**](https://babeljs.io/docs/en/babel-preset-env) – 🛠️ A smart preset that compiles modern JavaScript based on your target environments.
- [**@babel/core**](https://www.npmjs.com/package/@babel/core) – ⚙️ The core compiler module of Babel used for transforming ES6/ESNext code into backward-compatible JavaScript.

# 📚 Project Resources

### ⚙️ Node.js, Express, Joi & APIs

- 📘 [Node.js Official Docs](https://nodejs.org/en/docs)
- 🚀 [Express.js Guide](https://expressjs.com/en/starter/guide.html)
- 📡 [REST API Tutorial](https://restfulapi.net/)
- 📏 [JOI Documentation](https://joi.dev/)
- 📬 [Postman Collections](https://learning.postman.com/docs/getting-started/first-steps/creating-the-first-collection/)

### 🕷️ Web Scraping

- 🧰 [Puppeteer Docs](https://pptr.dev/)
- 🛠️ [puppeteer-extra (npm)](https://www.npmjs.com/package/puppeteer-extra)
- 🕵️ [puppeteer-extra-plugin-stealth (npm)](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth)

### ⏱️ Background Jobs & Queues

- 📥 [BullMQ Docs](https://docs.bullmq.io/)
- 🔄 [Redis for Node.js](https://redis.io/docs/clients/node/)

### 🗄️ PostgreSQL & Sequelize

- 📚 [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- 📖 [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- 🔗 [Sequelize Documentation](https://sequelize.org/)

### 🔔 Real-time & Notifications

- 🌐 [WebSockets Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- ✉️ [Nodemailer Guide](https://nodemailer.com/about/)
- 📲 [Firebase Push Notifications](https://firebase.google.com/docs/cloud-messaging)

### 🧪 Testing

- 🧬 [Jest Documentation](https://jestjs.io/docs/getting-started)
- 🧾 [Supertest (HTTP assertions)](https://www.npmjs.com/package/supertest)
- ⚙️ [Using Babel with Jest](https://jestjs.io/docs/configuration)
