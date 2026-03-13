const router = require("express").Router();

const adminAuthRoutes = require("./admin/admin-auth-routes");
const adminCategoryRoutes = require("./admin/admin-category-routes");
const adminProductRoutes = require("./admin/admin-product-routes");
const adminContentRoutes = require("./admin/admin-content-routes");
const adminSettingsRoutes = require("./admin/admin-settings-routes");
const adminDashboardRoutes = require("./admin/admin-dashboard-routes");

const publicCategoryRoutes = require("./public/category-routes");
const publicProductRoutes = require("./public/product-routes");
const publicContentRoutes = require("./public/content-routes");
const publicSettingsRoutes = require("./public/settings-routes");

router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/content", adminContentRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);

router.use("/categories", publicCategoryRoutes);
router.use("/products", publicProductRoutes);
router.use("/content", publicContentRoutes);
router.use("/settings", publicSettingsRoutes);

module.exports = router;