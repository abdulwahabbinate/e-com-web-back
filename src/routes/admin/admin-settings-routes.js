const router = require("express").Router();
const controller = require("../../controllers/admin/admin-settings-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("logos");

router.get(
  "/",
  adminAuthMiddleware,
  controller.getSettings.bind(controller)
);

router.put(
  "/update",
  adminAuthMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  controller.updateSettings.bind(controller)
);

module.exports = router;