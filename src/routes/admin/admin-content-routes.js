const router = require("express").Router();
const controller = require("../../controllers/admin/admin-content-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("content");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.single("image"),
  controller.createContent.bind(controller)
);

router.get(
  "/:slug",
  adminAuthMiddleware,
  controller.getContent.bind(controller)
);

router.put(
  "/update/:slug",
  adminAuthMiddleware,
  upload.single("image"),
  controller.updateContent.bind(controller)
);

module.exports = router;