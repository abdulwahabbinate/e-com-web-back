const router = require("express").Router();
const controller = require("../../controllers/public/category-controller");

router.get("/all", controller.getAllCategories.bind(controller));
router.get("/menu", controller.getMenuCategories.bind(controller));
router.get("/:slug", controller.getCategoryBySlug.bind(controller));

module.exports = router;