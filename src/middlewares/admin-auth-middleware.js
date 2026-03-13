const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { handlers } = require("../utilities/handlers/handlers");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return handlers.response.unauthorized({
        res,
        code: 403,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded || decoded.role !== "super_admin") {
      return handlers.response.unauthorized({
        res,
        code: 403,
        message: "Unauthorized",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return handlers.response.unauthorized({
      res,
      code: 403,
      message: "Invalid or expired token",
    });
  }
};
