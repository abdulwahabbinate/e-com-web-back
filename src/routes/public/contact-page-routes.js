const router = require("express").Router();
const controller = require("../../controllers/public/contact-page-controller");

router.get("/:slug", controller.getContactPage.bind(controller));

module.exports = router;