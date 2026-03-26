const router = require("express").Router();
const controller = require("../../controllers/public/about-page-controller");

router.get("/:slug", controller.getAboutPage.bind(controller));

module.exports = router;