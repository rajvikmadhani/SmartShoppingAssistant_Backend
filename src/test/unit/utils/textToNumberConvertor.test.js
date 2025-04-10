import { textToNumber } from "../../../utils/textToNumberConvertor.js"; // import the function to be tested

// convert text to number function
describe("utils -> textToNumberConverter.js ", () => {
  // this test checks if the textToNumber function converts a string to a number correctly.
  describe("textToNumber", () => {
    it('should convert US format with comma and period: "1,234.56"', () => {
      // Arrange & Act
      expect(textToNumber("1,234.56")).toBeCloseTo(1234.56);
    });

    // this test checks if the textToNumber function converts a string to a number correctly.
    it('should convert European format with period and comma: "1.234,56"', () => {
      // Arrange & Act
      expect(textToNumber("1.234,56")).toBeCloseTo(1234.56);
    });

    // this test checks if the textToNumber function converts a string to a number correctly.
    it('should convert US format with no thousands: "569.00"', () => {
      // Arrange & Act
      expect(textToNumber("569.00")).toBeCloseTo(569.0);
    });

    // this test checks if the textToNumber function converts a string to a number correctly.
    it('should convert European format with no thousands: "569,00"', () => {
      // Arrange & Act
      expect(textToNumber("569,00")).toBeCloseTo(569.0);
    });
  });
});
