const router = require("express").Router();
const controller = require("../../controllers/public/settings-controller");

router.get("/", controller.getSettings.bind(controller));

module.exports = router;