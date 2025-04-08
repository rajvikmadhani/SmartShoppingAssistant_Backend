import models from '../models/index.js'; // Added import
export const CreatePrimaryProduct = async (name, brand) => {
    const product = await models.Product.create({
        brand: brand,
        name: name,
        storage_gb: 0,
        ram_gb: 0,
        color: 'No color',
    });
    console.log('New product created:', product);
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
