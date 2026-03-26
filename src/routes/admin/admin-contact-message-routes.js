const router = require("express").Router();
const controller = require("../../controllers/admin/admin-contact-message-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.get(
  "/all",
  adminAuthMiddleware,
  controller.getContactMessages.bind(controller)
);

router.get(
  "/:id",
  adminAuthMiddleware,
  controller.getContactMessage.bind(controller)
);

router.put(
  "/update-status/:id",
  adminAuthMiddleware,
  controller.updateContactMessageStatus.bind(controller)
);

module.exports = router;