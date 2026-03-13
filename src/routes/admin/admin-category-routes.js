const router = require("express").Router();
const controller = require("../../controllers/admin/admin-category-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("categories");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.single("image"),
  controller.createCategory.bind(controller)
);

router.get(
  "/all",
  adminAuthMiddleware,
  controller.getAllCategories.bind(controller)
);

router.get(
  "/:id",
  adminAuthMiddleware,
  controller.getCategory.bind(controller)
);

router.put(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("image"),
  controller.updateCategory.bind(controller)
);

router.delete(
  "/delete/:id",
  adminAuthMiddleware,
  controller.deleteCategory.bind(controller)
);

module.exports = router;