import models from '../models/index.js'; // Added import
import { Op } from 'sequelize';
export const CreatePrimaryProduct = async (name, brand) => {
    const product = await models.Product.create({
        brand: brand,
        name: name,
        storage_gb: 0,
        ram_gb: 0,
        color: 'No color',
    });
    // console.log('New product created:', product);
    return product;
};

export const getProductWithPricesAndSeller = async (productfilter) => {
    const foundproduct = await models.Product.findOne({
        where: productfilter,
        include: [
            {
                model: models.Price,
                required: false,
                include: [
                    {
                        model: models.SellerStore,
                        required: false,
                        include: [
                            {
                                model: models.Seller,
                                required: false,
                                attributes: ['name'],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    return foundproduct;
};

export const getBestPrices = async () => {
    // console.log('Fetching best prices...');

    const products = await models.Product.findAll({
        attributes: ['id', 'name', 'brand'],
        include: [
            {
                model: models.Price,
                required: false,
                where: {
                    lastUpdated: {
                        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                include: [
                    {
                        model: models.SellerStore,
                        include: [
                            {
                                model: models.Seller,
                                attributes: ['name'],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    // console.log(`Fetched ${products.length} products`);

    const productsWithBestPrices = products
        .filter((p) => p.Prices && p.Prices.length > 0)
        .map((product) => {
            const bestPrice = product.Prices.reduce(
                (min, p) => (parseFloat(p.price) < parseFloat(min.price) ? p : min),
                product.Prices[0]
            );

            return {
                productId: product.id,
                name: product.name,
                brand: product.brand,
                storage_gb: product.storage_gb,
                ram_gb: product.ram_gb,
                color: bestPrice.color,
                price: bestPrice.price,
                currency: bestPrice.currency,
                product_link: bestPrice.product_link,
                storeId: bestPrice.storeId,
                mainImgUrl: bestPrice.mainImgUrl,
                seller: bestPrice.SellerStore?.Seller?.name || 'Unknown',
            };
        });

    // console.log(`Returning ${productsWithBestPrices.length} best-priced products`);
    return productsWithBestPrices;
};
