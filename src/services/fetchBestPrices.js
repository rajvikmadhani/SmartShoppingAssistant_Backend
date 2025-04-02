// Handles fetching best prices for homepage

const fetchBestPrices = async () => {
    const productsWithBestPrices = await models.Product.findAll({
        attributes: ['id', 'name', 'brand', 'storage_gb', 'ram_gb', 'color', 'mainImgUrl'],
        include: [
            {
                model: models.Price,
                attributes: ['price', 'product_link', 'storeId'],
                where: {
                    lastUpdated: {
                        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                order: [['price', 'ASC']],
                limit: 1,
            },
        ],
    });

    return productsWithBestPrices;
};
export default fetchBestPrices;
