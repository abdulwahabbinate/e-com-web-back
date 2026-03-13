const router = require("express").Router();
const controller = require("../../controllers/public/product-controller");

router.get("/all", controller.getAllProducts.bind(controller));
router.get("/:id", controller.getProduct.bind(controller));

module.exports = router;