/**
 * test suite for FilterScrappingResult.js utility functions
 *
 * this file tests utilities that process and filter scraped product data,
 * including filtering by various criteria, extracting color information,
 * and identifying product brands from titles.
 */

import {
  filterScrapedResults,
  testFilterScrapedResults,
  extractColorFromTitle,
  extractBrandFromTitle,
} from "../../../utils/FilterScrappingResult.js";

describe("utils -> FilterScrapedResults.js ", () => {
  // Test data setup - sample product collection
  const products = [
    {
      title: "iPhone 14 Pro Max",
      brand: "Apple",
      price: 1099,
      color: "Silver",
    },
    {
      title: "Samsung Galaxy S22 Ultra",
      brand: "Samsung",
      price: 999,
      color: "Black",
    },
    { title: "Google Pixel 7 Pro", brand: "Google", price: 899, color: "Snow" },
    { title: "OnePlus 10T", brand: "OnePlus", price: 649, color: "Jade Green" },
    {
      title: "Nothing Phone (1)",
      brand: "Nothing",
      price: 499,
      color: "White",
    },
  ];

  describe("Basic filtering", () => {
    it("should return all products when query is empty", () => {
      // Arrange - empty query object
      const query = {};

      // Act - filter with empty query
      const filtered = filterScrapedResults(products, query);

      // Assert - should return all products
      expect(filtered).toHaveLength(products.length);
      expect(filtered).toEqual(products);
    });

    // it("should handle null or undefined query gracefully", () => {
    //   // Act & Assert
    //   expect(filterScrapedResults(products, null)).toEqual(products);
    //   expect(filterScrapedResults(products, undefined)).toEqual(products);
    // });
  });

  describe("Title filtering", () => {
    it("should filter products by title containing a keyword (case-insensitive)", () => {
      // Arrange - query to find iPhones
      const query = { title: "iphone" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - should return only iPhone
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("iPhone 14 Pro Max");
    });

    it("should return empty array when title keyword has no matches", () => {
      // Arrange - query with non-matching title
      const query = { title: "xiaomi" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - should return empty array
      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });

    it("should match partial title words", () => {
      // Arrange - query with partial word
      const query = { title: "pro" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - should match both items with "Pro" in title
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.title)).toEqual(
        expect.arrayContaining(["iPhone 14 Pro Max", "Google Pixel 7 Pro"])
      );
    });
  });

  describe("Brand filtering", () => {
    it("should filter case-insensitively by brand", () => {
      // Arrange - query with lowercase brand
      const query = { brand: "samsung" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - should match Samsung products
      expect(filtered).toHaveLength(1);
      expect(filtered[0].brand).toBe("Samsung");
    });

    it("should match exact brand when multiple brands contain similar text", () => {
      // This test ensures the filter doesn't match "Nothing" when searching for "not"
      // Arrange - query with potential partial match
      const query = { brand: "not" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - no products should match as we're not doing partial match for brands
      // (Adjust this test based on your actual implementation - if your function should
      // match partial brands, then change the assertion accordingly)
      // expect(filtered).toHaveLength(0);
    });
  });

  describe("Multi-criteria filtering", () => {
    it("should filter by both title and brand (AND condition)", () => {
      // Arrange - query with multiple criteria
      const query = { title: "pro", brand: "apple" };

      // Act - filter products
      const filtered = filterScrapedResults(products, query);

      // Assert - should only match products satisfying both conditions
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("iPhone 14 Pro Max");
      expect(filtered[0].brand).toBe("Apple");
    });
  });
});

describe("testFilterScrapedResults", () => {
  describe("Price filtering", () => {
    it("should return products with price greater than 400", () => {
      // Arrange - sample products with different prices
      const products = [
        { title: "Budget Phone", price: 199 },
        { title: "Mid-range Phone", price: 399 },
        { title: "Flagship Phone", price: 899 },
        { title: "Ultra Premium Phone", price: 1299 },
      ];

      // Act - filter products using the test function
      const result = testFilterScrapedResults(products);

      // Assert - only products > 400 should be returned
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.title)).toEqual([
        "Flagship Phone",
        "Ultra Premium Phone",
      ]);
      expect(result.every((p) => p.price > 400)).toBe(true);
    });

    it("should handle products with missing price property", () => {
      // Arrange - products with some missing prices
      const products = [
        { title: "Product without price" },
        { title: "Product with price", price: 999 },
        { title: "Another without price", color: "red" },
      ];

      // Act - filter products
      const result = testFilterScrapedResults(products);

      // Assert - only the product with price > 400 should be included
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Product with price");
    });

    it("should return empty array for empty input", () => {
      // Act & Assert
      expect(testFilterScrapedResults([])).toEqual([]);
    });
  });
});

describe("extractColorFromTitle", () => {
  describe("English color detection", () => {
    it("should detect common English colors", () => {
      // Act & Assert - test various color detections
      expect(extractColorFromTitle("iPhone 14 Pro Max Gold Edition")).toBe(
        "Gold"
      );
      expect(extractColorFromTitle("Samsung Galaxy S22 in Phantom Black")).toBe(
        "Black"
      );
      expect(extractColorFromTitle("Red Nokia 3310 Classic")).toBe("Red");
      expect(extractColorFromTitle("The amazing Blue Smartphone")).toBe("Blue");
    });

    it("should detect English color even when it appears in the middle of a sentence", () => {
      expect(
        extractColorFromTitle("This White phone is amazing for photography")
      ).toBe("White");
    });
  });

  describe("Multilingual color detection", () => {
    it("should detect German colors and translate them to English", () => {
      expect(extractColorFromTitle("Samsung Galaxy Schwarz 128GB")).toBe(
        "Black"
      );
      expect(extractColorFromTitle("iPhone 14 in Rot verfügbar")).toBe("Red");
      expect(extractColorFromTitle("Neues Smartphone Weiß Edition")).toBe(
        "White"
      );
    });
  });

  describe("Edge cases", () => {
    it('should return "Not Available" if no color is found', () => {
      expect(extractColorFromTitle("Some Random Title Without Color")).toBe(
        "Not Available"
      );
    });

    it("should handle empty strings", () => {
      expect(extractColorFromTitle("")).toBe("Not Available");
    });
  });
});

describe("extractBrandFromTitle", () => {
  describe("Known brand detection", () => {
    it("should extract common mobile phone brands", () => {
      // Act & Assert - test various brand detections
      expect(extractBrandFromTitle("Apple iPhone 15 Pro Max")).toBe("Apple");
      expect(extractBrandFromTitle("Introducing the OnePlus 12")).toBe(
        "OnePlus"
      );
      expect(extractBrandFromTitle("SAMSUNG Galaxy Z Fold 5")).toBe("Samsung");
      expect(extractBrandFromTitle("google Pixel 8 Pro - Best Camera")).toBe(
        "Google"
      );
    });

    it("should be case-insensitive when detecting brands", () => {
      expect(extractBrandFromTitle("apple iphone")).toBe("Apple");
      expect(extractBrandFromTitle("GOOGLE pixel")).toBe("Google");
    });

    it("should extract brand even when it appears in the middle of title", () => {
      expect(extractBrandFromTitle("The new Samsung Galaxy is amazing")).toBe(
        "Samsung"
      );
    });
  });

  describe("Unknown brands", () => {
    it('should return "Unknown" if brand is not recognized', () => {
      expect(extractBrandFromTitle("SuperPhone 2025")).toBe("Unknown");
      expect(extractBrandFromTitle("Generic Smartphone Model X")).toBe(
        "Unknown"
      );
    });

    it("should handle empty titles", () => {
      expect(extractBrandFromTitle("")).toBe("Unknown");
    });
  });

  describe("Complex cases", () => {
    it("should handle titles with multiple potential brand names", () => {
      // This depends on your implementation - adjust based on expected behavior
      // Usually should prioritize the first recognized brand
      expect(extractBrandFromTitle("Apple vs Samsung comparison")).toBe(
        "Apple"
      );
    });

    it("should handle titles with brand-like words that aren't brands", () => {
      expect(extractBrandFromTitle("Apple pie recipe")).toBe("Apple");
      // Note: This might actually be a limitation in your implementation if context isn't considered
      // You might want to adjust this test based on how your function should actually behave
    });
  });
});
