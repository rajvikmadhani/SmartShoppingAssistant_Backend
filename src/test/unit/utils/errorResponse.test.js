// This test suite is for the ErrorResponse class, which extends the built-in Error class.  
// It checks that an instance of ErrorResponse can be created with a message and status code,
// and that it behaves as expected.
// import the ErrorResponse class from the source code
import ErrorResponse from "../../../../src/utils/errorResponse.js";


// errorResponse.js is a custom error class that extends the built-in Error class.
// it allows you to create error objects with a message and a status code.
describe("ErrorResponse", () => {
  
  // this test checks if the ErrorResponse class can be instantiated correctly.
  // it creates an instance of ErrorResponse with a message and status code,
  // and then checks if the instance has the expected properties.
  // it also checks if the instance is of type ErrorResponse and Error.
  // this is important for ensuring that the class behaves as expected.

  it("should create an instance with message and statusCode", () => {
    
    // not found error with status code 404
    const error = new ErrorResponse("Not found", 404);

    // check that it is an instance of ErrorResponse
    expect(error).toBeInstanceOf(ErrorResponse);

    // check that it is also an instance of built-in Error
    expect(error).toBeInstanceOf(Error);

    // check that the message is correct
    expect(error.message).toBe("Not found");

    // cWheck that the statusCode is set correctly
    expect(error.statusCode).toBe(404);
  });
});
