const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded._id);

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = adminAuthMiddleware;