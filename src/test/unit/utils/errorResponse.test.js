// This test suite is for the ErrorResponse class, which extends the built-in Error class.
// It checks that an instance of ErrorResponse can be created with a message and status code,
// and that it behaves as expected.
// import the ErrorResponse class from the source code
import ErrorResponse from "../../../../src/utils/errorResponse.js";

// errorResponse.js is a custom error class that extends the built-in Error class.
// it allows you to create error objects with a message and a status code.
describe("utils -> errorResponse.js ", () => {
  // instance of ErrorResponse is created with a message and status code.
  // the test checks that the instance is of type ErrorResponse and Error,
  it("should create an instance with message and statusCode", () => {
    // Arrange & Act
    const error = new ErrorResponse("Not found", 404);

    // Assert
    expect(error).toBeInstanceOf(ErrorResponse);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });

  //this test checks the status code and message of the ErrorResponse instance.
  // it creates an instance of ErrorResponse with a message and status code,
  // and then checks if the instance has the expected properties.
  it("should handle different status codes and messages", () => {
    // Arrange & Act
    const testCases = [
      { message: "Bad request", statusCode: 400 },
      { message: "Unauthorized", statusCode: 401 },
      { message: "Server error", statusCode: 500 },
    ];

    // Assert
    testCases.forEach(({ message, statusCode }) => {
      const error = new ErrorResponse(message, statusCode);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });
  });

  // stack trace is a property of the Error object that contains a string representation of the point in the code at which the Error was instantiated.
  // this test checks if the stack trace is preserved when creating an instance of ErrorResponse.
  it("should preserve the error stack trace", () => {
    // Arrange & Act
    const error = new ErrorResponse("Test error", 500);

    // Assert
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
    expect(error.stack).toContain("errorResponse.test.js");
  });

  // this test checks if the ErrorResponse class has a name property.
  it("should have Error name property", () => {
    // Arrange & Act
    const error = new ErrorResponse("Test error", 500);

    // Assert
    expect(error.name).toBeDefined();
  });
});
