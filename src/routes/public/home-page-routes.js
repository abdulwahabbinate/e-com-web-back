const router = require("express").Router();
const controller = require("../../controllers/public/home-page-controller");

router.get("/:slug", controller.getHomePage.bind(controller));

module.exports = router;