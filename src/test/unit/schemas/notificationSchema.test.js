import Joi from "joi"; // import Joi for schema validation
import notificationSchema from "../../../schemas/notificationSchema.js"; // import the notification schema

// schema for testing
describe("schemas -> notificationSchema.js ", () => {
  // test suite for notificationSchema
  describe("notificationSchema.POST", () => {
    // test suite for POST method
    const schema = notificationSchema.POST;
    let validData;

    // setup common test variables
    beforeEach(() => {
      // setup common test data
      validData = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        message: "This is a test notification",
        read: true,
      };
    });

    // test cases for valid and invalid inputs
    // test suite for valid and invalid inputs
    describe("Valid inputs", () => {
      it("should pass validation with valid input", () => {
        // validate the schema with valid data
        const { error, value } = schema.validate(validData);

        // no error should be present
        expect(error).toBeUndefined();
        // value should be equal to validData
        expect(value).toEqual(validData);
      });

      // test case for default value
      it("should apply default value for read", () => {
        // validate the schema with input data
        const inputData = {
          userId: validData.userId,
          message: "Another test notification",
        };

        // validate the schema with input data
        const { error, value } = schema.validate(inputData);

        // undefined error should be present
        expect(error).toBeUndefined();
        // vale read should be false
        expect(value.read).toBe(false);
        // value userId should be equal to inputData userId
        expect(value.userId).toBe(inputData.userId);
        // value message should be equal to inputData message
        expect(value.message).toBe(inputData.message);
      });
    });

    describe("Invalid inputs", () => {
      it("should fail if userId is missing", () => {
        // userId is required in the schema
        const inputData = {
          message: "Missing userId",
        };

        // error should be present
        const { error } = schema.validate(inputData);
        // error should be defined
        expect(error).toBeDefined();
        // error details should contain userId path
        expect(error.details[0].path).toEqual(["userId"]);

        // error message should contain userId is required
        expect(error.details[0].message).toContain('"userId" is required');
      });

      it("should fail if userId is not a valid UUID", () => {
        // userId is required in the schema
        const inputData = {
          userId: "not-a-uuid",
          message: "Invalid UUID",
        };

        // error should be present
        const { error } = schema.validate(inputData);

        // error should be defined
        expect(error).toBeDefined();
        // error details should contain userId path
        expect(error.details[0].path).toEqual(["userId"]);
        // error message should contain userId must be a valid
        expect(error.details[0].message).toEqual(
          '"userId" must be a valid GUID'
        );
      });

      it("should fail if message is too short", () => {
        // a minimum length constraint
        const inputData = {
          userId: validData.userId,
          message: "Hey",
        };

        //error should be present
        const { error } = schema.validate(inputData);
        // error should be defined
        expect(error).toBeDefined();
        // error details should contain message path
        expect(error.details[0].path).toEqual(["message"]);

        // error message should contain message length must be at least 5 characters long
        expect(error.details[0].message).toContain(
          '"message" length must be at least 5 characters long'
        );
      });

      it("should fail if message is too long", () => {
        // a maximum length constraint
        const longMessage = "A".repeat(1001); // Adjust based on your actual max length
        // input data with long message
        const inputData = {
          userId: validData.userId,
          message: longMessage,
        };

        // error should be present
        const { error } = schema.validate(inputData);
        // error should be defined
        expect(error).toBeDefined();
        // error details should contain message
        expect(error.details[0].path).toEqual(["message"]);
        // error message should contain message length must be less than or equal to 1000 characters long
        expect(error.details[0].message).toContain("length");
      });
    });

    describe("Validation options", () => {
      it("should allow unknown fields when allowUnknown is true", () => {
        // test case for unknown fields
        const inputData = {
          ...validData,
          timestamp: new Date().toISOString(),
        };

        // validate the schema with input data
        const { error } = schema.validate(inputData, { allowUnknown: true });
        // error should be undefined
        expect(error).toBeUndefined();
      });
    });

    describe("Edge cases", () => {
      // test case for empty message
      it("should fail with empty message", () => {
        // input data with empty message
        const inputData = {
          userId: validData.userId,
          message: "",
        };

        // validate the schema with input data
        const { error } = schema.validate(inputData);
        // error should be present
        expect(error).toBeDefined();
        // error details should contain message
        expect(error.details[0].path).toEqual(["message"]);
      });

      it("should fail with null values", () => {
        // input data with null message
        const inputData = {
          userId: validData.userId,
          message: null,
        };

        // error should be present
        const { error } = schema.validate(inputData);
        // error should be defined
        expect(error).toBeDefined();
      });
    });
  });
});
