const router = require("express").Router();
const controller = require("../../controllers/public/stripe-payment-controller");

router.post(
  "/create-payment-intent",
  controller.createPaymentIntent.bind(controller)
);

module.exports = router;