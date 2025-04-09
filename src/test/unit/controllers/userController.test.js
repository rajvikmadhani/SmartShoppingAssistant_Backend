//  supertest is used to simulate HTTP requests to your Express app
import request from "supertest";
// this is your main Express app
import app from "../../../server.js";
// sequelize models
import models from "../../../models/index.js";
// used to generate JWTs for simulating logged-in users
import jwt from "jsonwebtoken";

//  MOCKING THE SEQUELIZE USER MODEL
// we replace the real `User.findByPk` with a fake version using Jest
jest.mock("../../../models/index.js", () => ({
  User: {
    findByPk: jest.fn(), 
  },
}));

// FAKE USER DATA
// simulates a user from the database (excluding sensitive info like password)
const fakeUser = {
  id: 1,
  name: "Andrei",
  surname: "Razvan",
  email: "andrei@example.com",
  city: "Berlin",
  password: "hashedpassword", // real DB would include password, but API should exclude it

  // sequelize calls `.toJSON()` when returning data — we simulate that here
  toJSON: function () {
    // remove password before sending back
    const { password, ...rest } = this;
    return rest;
  },
};

// HELPER: GENERATE A FAKE JWT TOKEN
// this mimics the token a real user would send when logged in
// the controller expects `req.user.id` — that's decoded from this token
const generateToken = (userId) => {
  // normally you'd use process.env.JWT_SECRET, but for tests we hardcode it
  return jwt.sign({ id: userId }, "your_jwt_secret");
};

// TEST BLOCK FOR /api/users/me CONTROLLER
describe("GET /api/users/me", () => {
  // SUCCESS CASE: User is found and returned
  it("should return the current user profile", async () => {
    // Arrange: simulate DB returning our fake user
    models.User.findByPk.mockResolvedValue(fakeUser);

    // Arrange: create a token to simulate a logged-in user
    const token = generateToken(fakeUser.id);

    // Act: send GET request to /api/users/me with auth header
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    // Assert: check status and returned data
    expect(res.statusCode).toBe(200); // response should be 200 OK
    expect(res.body).toHaveProperty("id", fakeUser.id); // user ID matches
    expect(res.body).toHaveProperty("name", fakeUser.name); // name matches
    expect(res.body).not.toHaveProperty("password"); // password should NOT be returned
  });

  // FAILURE CASE: user is not found in DB
  it("should return 404 if user is not found", async () => {
    // Arrange: simulate DB returning null (user not found)
    models.User.findByPk.mockResolvedValue(null);

    // Arrange: use a token with an ID that doesn't exist
    const token = generateToken(999); // pretend user 999 does not exist

    // Act: make the request
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    // Assert: should get 404 and proper message
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("user not found");
  });
});
