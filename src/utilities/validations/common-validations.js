const { handlers } = require("../handlers/handlers");

const sendValidationError = ({ res, errors = [] }) => {
  return handlers.response.failed({
    res,
    code: 400,
    message: "Validation failed",
    data: errors,
  });
};

module.exports = {
  sendValidationError,
};
