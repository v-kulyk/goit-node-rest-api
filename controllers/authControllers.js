import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";

const { JWT_SECRET } = process.env;

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(HttpError(409, "Email in use"));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  console.log("logging in");
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(HttpError(401, "Email or password is wrong"));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "23h" });

    // Update user with token
    await user.update({ token });

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    await req.user.update({ token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/current
export const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

// PATCH /api/auth/subscription
export const updateSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;

    await req.user.update({ subscription });

    res.json({
      email: req.user.email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
