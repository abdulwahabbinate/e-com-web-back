const router = require("express").Router();
const controller = require("../../controllers/public/payment-setting-controller");

router.get("/default", controller.getPaymentSettings.bind(controller));

module.exports = router;