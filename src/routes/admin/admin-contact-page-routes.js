const router = require("express").Router();
const controller = require("../../controllers/admin/admin-contact-page-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.post(
  "/create",
  adminAuthMiddleware,
  controller.createContactPage.bind(controller)
);

router.get(
  "/:slug",
  adminAuthMiddleware,
  controller.getContactPage.bind(controller)
);

router.put(
  "/update/:slug",
  adminAuthMiddleware,
  controller.updateContactPage.bind(controller)
);

module.exports = router;