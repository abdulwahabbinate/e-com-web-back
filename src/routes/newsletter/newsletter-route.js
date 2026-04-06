const router = require("express").Router();
const controller = require("../../controllers/newsletter/newsletter-controller");

router.post("/subscribe", controller.subscribe.bind(controller));

module.exports = router;