'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('Prices', ['productId', 'color', 'ram_gb', 'storage_gb', 'sellerStoreId'], {
            unique: true,
            name: 'price_variant_unique_index',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('Prices', 'price_variant_unique_index');
    },
};
