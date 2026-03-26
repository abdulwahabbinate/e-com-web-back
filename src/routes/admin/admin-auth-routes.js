const router = require("express").Router();
const controller = require("../../controllers/admin/admin-auth-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("users");

router.post("/login", controller.login.bind(controller));
router.get("/profile", adminAuthMiddleware, controller.profile.bind(controller));
router.put(
  "/profile/update",
  adminAuthMiddleware,
  upload.single("avatar"),
  controller.updateProfile.bind(controller)
);
router.put(
  "/change-password",
  adminAuthMiddleware,
  controller.changePassword.bind(controller)
);

module.exports = router;