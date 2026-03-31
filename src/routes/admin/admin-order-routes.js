const router = require("express").Router();
const controller = require("../../controllers/admin/admin-order-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.get(
  "/all",
  adminAuthMiddleware,
  controller.getOrders.bind(controller)
);

router.get(
  "/:id",
  adminAuthMiddleware,
  controller.getOrderById.bind(controller)
);

router.put(
  "/update-status/:id",
  adminAuthMiddleware,
  controller.updateOrderStatus.bind(controller)
);

module.exports = router;