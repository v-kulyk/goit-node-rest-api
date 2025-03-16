import User from "../models/user";
import { login } from "../controllers/authControllers";
import { expect, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

describe("Login Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
        email: "test@example.com",
        password: "hashedPassword",
      },
    };

    // Mock response object
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock next middleware function
    next = jest.fn();

    // Mock environment variable
    process.env.JWT_SECRET = "test-secret";
  });

  it("should return status code 200, a token, and a user object with email and subscription fields as strings", async () => {
    // Mock user for test
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      subscription: "starter",
      update: jest.fn(),
    };

    // Set up the mocks
    User.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue("test-token");

    // Call the login function directly
    await login(req, res, next);

    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    // Extract the argument passed to res.json
    const responseBody = res.json.mock.calls[0][0];

    // Check that token is returned
    expect(responseBody).toHaveProperty("token");
    expect(responseBody.token).toBe("test-token");

    // Check that user object is returned with email and subscription as strings
    expect(responseBody).toHaveProperty("user");
    expect(responseBody.user).toHaveProperty("email");
    expect(responseBody.user).toHaveProperty("subscription");
    expect(typeof responseBody.user.email).toBe("string");
    expect(typeof responseBody.user.subscription).toBe("string");
  });
});
