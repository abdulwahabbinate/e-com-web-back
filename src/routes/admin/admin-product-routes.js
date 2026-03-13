const router = require("express").Router();
const controller = require("../../controllers/admin/admin-product-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("products");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.array("images", 10),
  controller.createProduct.bind(controller)
);

router.get(
  "/all",
  adminAuthMiddleware,
  controller.getAllProducts.bind(controller)
);

router.get(
  "/:id",
  adminAuthMiddleware,
  controller.getProduct.bind(controller)
);

router.put(
  "/update/:id",
  adminAuthMiddleware,
  upload.array("images", 10),
  controller.updateProduct.bind(controller)
);

router.delete(
  "/delete/:id",
  adminAuthMiddleware,
  controller.deleteProduct.bind(controller)
);

module.exports = router;