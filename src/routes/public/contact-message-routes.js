const router = require("express").Router();
const controller = require("../../controllers/public/contact-message-controller");

router.post("/submit", controller.submitContactMessage.bind(controller));

module.exports = router;