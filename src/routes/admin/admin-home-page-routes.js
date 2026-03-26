const router = require("express").Router();
const controller = require("../../controllers/admin/admin-home-page-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");
const { createUploader } = require("../../middlewares/upload-middleware");

const upload = createUploader("home-page");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.fields([
    { name: "hero_slide_image_0", maxCount: 1 },
    { name: "hero_slide_image_1", maxCount: 1 },
    { name: "hero_slide_image_2", maxCount: 1 },
    { name: "promo_left_image", maxCount: 1 },
    { name: "promo_right_image", maxCount: 1 },
    { name: "lookbook_item_image_0", maxCount: 1 },
    { name: "lookbook_item_image_1", maxCount: 1 },
    { name: "lookbook_item_image_2", maxCount: 1 },
    { name: "lookbook_item_image_3", maxCount: 1 },
    { name: "limited_offer_image", maxCount: 1 },
  ]),
  controller.createHomePage.bind(controller)
);

router.get(
  "/:slug",
  adminAuthMiddleware,
  controller.getHomePage.bind(controller)
);

router.put(
  "/update/:slug",
  adminAuthMiddleware,
  upload.fields([
    { name: "hero_slide_image_0", maxCount: 1 },
    { name: "hero_slide_image_1", maxCount: 1 },
    { name: "hero_slide_image_2", maxCount: 1 },
    { name: "promo_left_image", maxCount: 1 },
    { name: "promo_right_image", maxCount: 1 },
    { name: "lookbook_item_image_0", maxCount: 1 },
    { name: "lookbook_item_image_1", maxCount: 1 },
    { name: "lookbook_item_image_2", maxCount: 1 },
    { name: "lookbook_item_image_3", maxCount: 1 },
    { name: "limited_offer_image", maxCount: 1 },
  ]),
  controller.updateHomePage.bind(controller)
);

module.exports = router;