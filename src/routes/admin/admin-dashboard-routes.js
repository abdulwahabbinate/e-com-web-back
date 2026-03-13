const router = require("express").Router();
const controller = require("../../controllers/admin/admin-dashboard-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.get(
  "/stats",
  adminAuthMiddleware,
  controller.getStats.bind(controller)
);

module.exports = router;