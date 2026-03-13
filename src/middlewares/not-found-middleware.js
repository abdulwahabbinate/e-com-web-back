const { handlers } = require("../utilities/handlers/handlers");

module.exports = (req, res) => {
  return handlers.response.unavailable({
    res,
    code: 404,
    message: "Route not found",
  });
};
