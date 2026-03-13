const router = require("express").Router();
const controller = require("../../controllers/public/content-controller");

router.get("/:slug", controller.getContent.bind(controller));

module.exports = router;