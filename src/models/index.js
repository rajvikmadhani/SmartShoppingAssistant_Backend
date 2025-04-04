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

/* ============================
    Model Associations
============================ */

//  Price relationships
Price.belongsTo(Product, { foreignKey: 'productId' });
Price.belongsTo(SellerStore, { foreignKey: 'sellerStoreId' });
Product.hasMany(Price, { foreignKey: 'productId' });
SellerStore.hasMany(Price, { foreignKey: 'sellerStoreId' });

//  PriceHistory relationships
PriceHistory.belongsTo(Product, { foreignKey: 'productId' });
PriceHistory.belongsTo(SellerStore, { foreignKey: 'sellerStoreId' });
Product.hasMany(PriceHistory, { foreignKey: 'productId' });
SellerStore.hasMany(PriceHistory, { foreignKey: 'sellerStoreId' });

//  Wishlist relationships
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'productId', otherKey: 'userId' });
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'userId', otherKey: 'productId' });

//  PriceAlert relationships
Product.belongsToMany(User, { through: PriceAlert, foreignKey: 'productId', otherKey: 'userId' });
User.belongsToMany(Product, { through: PriceAlert, foreignKey: 'userId', otherKey: 'productId' });

//  Coupon & SellerStore
SellerStore.hasMany(Coupon, { foreignKey: 'sellerStoreId' });
Coupon.belongsTo(SellerStore, { foreignKey: 'sellerStoreId' });

//  ScrapingJob & Product
Product.hasMany(ScrapingJob, { foreignKey: 'productId' });
ScrapingJob.belongsTo(Product, { foreignKey: 'productId' });

//  ScrapingJob & Store
Store.hasMany(ScrapingJob, { foreignKey: 'storeId' });
ScrapingJob.belongsTo(Store, { foreignKey: 'storeId' });

//  User & Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

//  Seller & Store (Many-to-Many)
Seller.belongsToMany(Store, { through: SellerStore, foreignKey: 'sellerId' });
Store.belongsToMany(Seller, { through: SellerStore, foreignKey: 'storeId' });

/* ============================
   🛠 Ensuring Models Are Loaded Correctly
============================ */

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
        console.warn(` Warning: Model ${name} was not loaded correctly.`);
    } else {
        console.log(` Model ${name} loaded successfully.`);
    }
});

export default models;
