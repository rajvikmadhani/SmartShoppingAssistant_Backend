'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addIndex('Prices', ['productId', 'color', 'ram_gb', 'storage_gb', 'sellerStoreId'], {
        unique: true,
        name: 'price_variant_unique_index',
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Prices', 'price_variant_unique_index');
}
