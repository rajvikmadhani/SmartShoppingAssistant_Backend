import { sequelize } from '../db/index.js';
import UserModel from './user.js';
import ProductModel from './product.js';
import StoreModel from './store.js';
import PriceModel from './price.js';
import PriceHistoryModel from './priceHistory.js';
import WishlistModel from './wishlist.js';
import PriceAlertModel from './priceAlert.js';
import CouponModel from './coupon.js';
import ScrapingJobModel from './scrapingJob.js';
import NotificationModel from './notification.js';

// Initialize models
const User = UserModel(sequelize);
const Product = ProductModel(sequelize);
const Store = StoreModel(sequelize);
const Price = PriceModel(sequelize);
const PriceHistory = PriceHistoryModel(sequelize);
const Wishlist = WishlistModel(sequelize);
const PriceAlert = PriceAlertModel(sequelize);
const Coupon = CouponModel(sequelize);
const ScrapingJob = ScrapingJobModel(sequelize);
const Notification = NotificationModel(sequelize);

// Define relationships
Product.hasMany(Price);
Price.belongsTo(Product);

Product.hasMany(PriceHistory);
PriceHistory.belongsTo(Product);

Product.belongsToMany(User, { through: Wishlist });
User.belongsToMany(Product, { through: Wishlist });

Product.belongsToMany(User, { through: PriceAlert });
User.belongsToMany(Product, { through: PriceAlert });

Store.hasMany(Price);
Price.belongsTo(Store);

Store.hasMany(PriceHistory);
PriceHistory.belongsTo(Store);

Store.hasMany(Coupon);
Coupon.belongsTo(Store);

Product.hasMany(ScrapingJob);
ScrapingJob.belongsTo(Product);

Store.hasMany(ScrapingJob);
ScrapingJob.belongsTo(Store);

User.hasMany(Notification);
Notification.belongsTo(User);

// Ensuring all models are loaded correctly
const models = {
    User,
    Product,
    Store,
    Price,
    PriceHistory,
    Wishlist,
    PriceAlert,
    Coupon,
    ScrapingJob,
    Notification,
};

Object.entries(models).forEach(([name, model]) => {
    if (!model) {
        console.warn(`Warning: Model ${name} was not loaded correctly.`);
    } else {
        console.log(`Model ${name} loaded successfully.`);
    }
});

export default models;
