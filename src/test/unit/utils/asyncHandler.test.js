/**
 * tests for the asyncHandler utility
 *
 * asyncHandler is a utility that wraps Express route handlers to automatically
 * catch any errors thrown in async functions and pass them to Express's next() middleware,
 * eliminating the need for try/catch blocks in every route handler.
 */

import asyncHandler from "../../../utils/asyncHandler.js";

describe("utils -> asyncHandler.js ", () => {
  describe("asyncHandler utility", () => {
    // setup common test variables
    let req, res, next, mockHandler, wrapped;

    beforeEach(() => {
      // create fresh mocks for each test
      req = { params: { id: "123" }, body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    describe("successful execution", () => {
      it("should call the handler function and not call next when resolved", async () => {
        // Arrange: setup a mock handler that resolves successfully
        mockHandler = jest.fn().mockResolvedValue("done");
        wrapped = asyncHandler(mockHandler);

        // Act: call the wrapped handler
        await wrapped(req, res, next);

        // Assert: handler was called with Express params and next wasn't called (no errors)
        expect(mockHandler).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
      });

      it("should allow the handler to interact with res object normally", async () => {
        // Arrange: setup a handler that uses res methods
        mockHandler = jest.fn().mockImplementation(async (req, res) => {
          res.status(200).json({ success: true });
        });
        wrapped = asyncHandler(mockHandler);

        // Act: call the wrapped handler
        await wrapped(req, res, next);

        // Assert: response methods were called as expected
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should catch standard errors and pass them to next middleware", async () => {
        // Arrange: setup a handler that throws a standard Error
        const error = new Error("Something failed");
        mockHandler = jest.fn().mockRejectedValue(error);
        wrapped = asyncHandler(mockHandler);

        // Act: call the wrapped handler
        await wrapped(req, res, next);

        // Assert: error was properly passed to next middleware
        expect(mockHandler).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledWith(error);
      });

      it("should handle non-Error objects thrown by the handler", async () => {
        // Arrange: setup a handler that throws a string instead of an Error
        const errorMessage = "String error message";
        mockHandler = jest.fn().mockRejectedValue(errorMessage);
        wrapped = asyncHandler(mockHandler);

        // Act: call the wrapped handler
        await wrapped(req, res, next);

        // Assert: non-error value was properly passed to next middleware
        expect(mockHandler).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
      });
    });
  });
});
