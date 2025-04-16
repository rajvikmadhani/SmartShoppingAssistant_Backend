import {
  CreatePrimaryProduct,
  getProductWithPricesAndSeller,
  getBestPrices,
} from "../../../utils/productRepo.js"; //import the functions to be tested

import models from "../../../models/index.js"; //import the models to be used in the tests

// auto-mock the Sequelize models
jest.mock("../../../models/index.js", () => ({
  Product: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Price: {},
  SellerStore: {},
  Seller: {},
}));

describe("utils -> productRepo.js ", () => {
  // this test checks if the CreatePrimaryProduct function creates a product with default fields.
  // this test checks if the CreatePrimaryProduct function creates a product with default fields.
  // it mocks the Product.create method to return a mock product object.

  describe("CreatePrimaryProduct", () => {
    // it("should create a product with default fields", async () => {
    //   // Arrange
    //   const mockProduct = { id: 1, name: "iPhone", brand: "Apple" };
    //   // Act
    //   models.Product.create.mockResolvedValue(mockProduct);
    //   const result = await CreatePrimaryProduct("iPhone", "Apple");
    //   // Assert
    //   expect(models.Product.create).toHaveBeenCalledWith({
    //     ram_gb: 0,
    //     storage_gb: 0,
    //     color: "No color",
    //     brand: "Apple",
    //     name: "iPhone",
    //   });
    //   expect(result).toEqual(mockProduct);
    // });
  });

  // this test checks if the getProductWithPricesAndSeller function returns a product with price and seller nested.
  // it mocks the Product.findOne method to return a mock product object
  describe("getProductWithPricesAndSeller", () => {
    it("should return a product with price & seller nested", async () => {
      // Arrange
      const mockProduct = {
        name: "Galaxy S21",
        Prices: [
          {
            price: "499",
            SellerStore: {
              Seller: {
                name: "Amazon",
              },
            },
          },
        ],
      };

      // Act
      models.Product.findOne.mockResolvedValue(mockProduct);

      const result = await getProductWithPricesAndSeller({
        name: "Galaxy S21",
      });

      // Assert
      expect(models.Product.findOne).toHaveBeenCalledWith({
        where: { name: "Galaxy S21" },
        include: expect.any(Array),
      });

      expect(result).toHaveProperty("Prices");
      expect(result.Prices).toHaveLength(1);
      expect(result).toEqual(mockProduct);
    });
  });

  // this test checks if the getBestPrices function returns filtered and mapped best-priced products.
  // it mocks the Product.findAll method to return a mock product object

  describe("getBestPrices", () => {
    it("should return filtered and mapped best-priced products", async () => {
      // Arrange
      const mockProducts = [
        {
          id: 1,
          name: "iPhone",
          brand: "Apple",
          Prices: [
            {
              price: "799",
              currency: "USD",
              color: "Black",
              product_link: "http://example.com",
              storeId: 101,
              mainImgUrl: "http://img.com",
              SellerStore: {
                Seller: {
                  name: "Amazon",
                },
              },
            },
          ],
        },
      ];

      // Act
      models.Product.findAll.mockResolvedValue(mockProducts);

      const result = await getBestPrices();

      // Assert
      expect(models.Product.findAll).toHaveBeenCalledWith({
        attributes: ["id", "name", "brand"],
        include: expect.any(Array),
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "iPhone",
        price: "799",
        seller: "Amazon",
      });
    });
  });
});
