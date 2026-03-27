const router = require("express").Router();
const controller = require("../../controllers/public/order-controller");

router.post("/create", controller.createOrder.bind(controller));

module.exports = router;