const router = require("express").Router();
const controller = require("../../controllers/admin/admin-about-page-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("about-page");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.fields([{ name: "story_image", maxCount: 1 }]),
  controller.createAboutPage.bind(controller)
);

router.get(
  "/:slug",
  adminAuthMiddleware,
  controller.getAboutPage.bind(controller)
);

router.put(
  "/update/:slug",
  adminAuthMiddleware,
  upload.fields([{ name: "story_image", maxCount: 1 }]),
  controller.updateAboutPage.bind(controller)
);

module.exports = router;