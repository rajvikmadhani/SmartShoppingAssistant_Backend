import { sequelize } from '../db/index.js';
import UserModel from './User.js';
import ProductModel from './product.js';
import StoreModel from './store.js';
import PriceModel from './price.js';
import PriceHistoryModel from './priceHistory.js';
import WishlistModel from './wishlist.js';
import PriceAlertModel from './priceAlert.js';
import CouponModel from './coupon.js';
import ScrapingJobModel from './scrapingJob.js';
import NotificationModel from './notification.js';
import SellerModel from './seller.js';
import SellerStoreModel from './seller-store.js';

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
const Seller = SellerModel(sequelize);
const SellerStore = SellerStoreModel(sequelize);

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

SellerStore.hasMany(PriceHistory);
PriceHistory.belongsTo(SellerStore);

SellerStore.hasMany(Coupon);
Coupon.belongsTo(SellerStore);

Product.hasMany(ScrapingJob);
ScrapingJob.belongsTo(Product);

Store.hasMany(ScrapingJob);
ScrapingJob.belongsTo(Store);

User.hasMany(Notification);
Notification.belongsTo(User);

Seller.belongsToMany(Store, {
    through: SellerStore,
    foreignKey: 'sellerId', // Use the existing column
    otherKey: 'storeId', // Use the existing column
});

Store.belongsToMany(Seller, {
    through: SellerStore,
    foreignKey: 'storeId', // Use the existing column
    otherKey: 'sellerId', // Use the existing column
});

// Ensuring all models are loaded correctly
const models = {
    User,
    Product,
    Store,
    Seller,
    Price,
    PriceHistory,
    SellerStore,
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
