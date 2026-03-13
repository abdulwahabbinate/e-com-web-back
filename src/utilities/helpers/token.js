const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: "super_admin",
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
};

module.exports = {
  generateAdminToken,
};
