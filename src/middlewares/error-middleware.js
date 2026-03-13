const { handlers } = require("../utilities/handlers/handlers");

module.exports = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  return handlers.response.error({
    res,
    code: 500,
    message: "Internal server error",
  });
};