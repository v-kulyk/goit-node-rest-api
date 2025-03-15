import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(HttpError(401, "Not authorized"));
  }

  try {
    // Verify token
    const { id } = jwt.verify(token, JWT_SECRET);

    // Find user by id and token
    const user = await User.findOne({ where: { id, token } });

    if (!user) {
      return next(HttpError(401, "Not authorized"));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
};

export default authenticate;
