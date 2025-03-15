import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { login } from "../controllers/authControllers.js";
import User from "../models/user.js";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("../models/user.js");

// Setup test app
const app = express();
app.use(express.json());
app.post("/api/auth/login", login);

describe("Login Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();

    // Mock the response object
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock the next middleware function
    next = jest.fn();

    // Mock environment variable
    process.env.JWT_SECRET = "test-secret";
  });

  it("should return 200 status code, token and user object on successful login", async () => {
    // Mock user for test
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      subscription: "starter",
      avatarURL: "https://gravatar.com/avatar/test",
      update: jest.fn(),
    };

    // Set up the mocks
    User.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue("test-token");

    // Test request
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("subscription");
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "test-secret", {
      expiresIn: "23h",
    });
    expect(mockUser.update).toHaveBeenCalledWith({ token: "test-token" });
  });
});
