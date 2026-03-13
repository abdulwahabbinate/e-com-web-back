const router = require("express").Router();
const controller = require("../../controllers/admin/admin-auth-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.post("/login", controller.login.bind(controller));
router.get("/profile", adminAuthMiddleware, controller.profile.bind(controller));

module.exports = router;