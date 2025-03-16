import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import { sendVerificationEmail, resendVerificationEmail } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Generate Gravatar URL
    const avatarURL = gravatar.url(email, {
      s: "250",
      r: "pg",
      d: "identicon",
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL: avatarURL,
      verificationToken,
      verify: false,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(HttpError(401, "Email or password is wrong"));
    }

    // Check if user's email is verified
    if (!user.verify) {
      return next(HttpError(401, "Email not verified. Please verify your email first."));
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
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    // Find user by verification token
    const user = await User.findOne({ where: { verificationToken } });
    if (!user) {
      return next(HttpError(404, "User not found"));
    }

    // Update user verification status
    await user.update({
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return next(HttpError(400, "missing required field email"));
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(HttpError(404, "User not found"));
    }

    // Check if user is already verified
    if (user.verify) {
      return res.status(400).json({
        message: "Verification has already been passed",
      });
    }

    // Generate new verification token if needed
    if (!user.verificationToken) {
      user.verificationToken = uuidv4();
      await user.save();
    }

    // Resend verification email
    await resendVerificationEmail(email, user.verificationToken);

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
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
  const { email, subscription, avatarURL } = req.user;

  res.json({
    email,
    subscription,
    avatarURL,
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
      avatarURL: req.user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/auth/avatars
export const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { path: tempPath, originalname } = req.file;

    // Create directories if they don't exist
    const publicDir = path.join(__dirname, "../public");
    const avatarsDir = path.join(publicDir, "avatars");

    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(avatarsDir, { recursive: true });

    // Generate unique filename using user id and original extension
    const extension = originalname.split(".").pop();
    const filename = `${id}-${Date.now()}.${extension}`;
    const avatarPath = path.join(avatarsDir, filename);

    // Move file from temp directory to public/avatars
    await fs.rename(tempPath, avatarPath);

    // Create relative URL for the avatar
    const avatarURL = `/avatars/${filename}`;

    // Update user with new avatar URL
    await req.user.update({ avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    // Clean up temp file if it exists
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    next(error);
  }
};