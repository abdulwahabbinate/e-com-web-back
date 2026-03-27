const router = require("express").Router();
const controller = require("../../controllers/admin/admin-payment-setting-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.get(
  "/default",
  adminAuthMiddleware,
  controller.getPaymentSettings.bind(controller)
);

router.put(
  "/update",
  adminAuthMiddleware,
  controller.updatePaymentSettings.bind(controller)
);

module.exports = router;