const router = require("express").Router();

const adminAuthRoutes = require("./admin/admin-auth-routes");
const adminHomePageRoutes = require("./admin/admin-home-page-routes");
const adminAboutPageRoutes = require("./admin/admin-about-page-routes");
const adminContactPageRoutes = require("./admin/admin-contact-page-routes");
const adminCategoryRoutes = require("./admin/admin-category-routes");
const adminProductRoutes = require("./admin/admin-product-routes");
const adminContentRoutes = require("./admin/admin-content-routes");
const adminContectMessageRoutes = require("./admin/admin-contact-message-routes");
const adminSettingsRoutes = require("./admin/admin-settings-routes");
const adminDashboardRoutes = require("./admin/admin-dashboard-routes");
const adminPaymentSettingsRoutes = require("./admin/admin-payment-setting-routes");

const publicHomePageRoutes = require("./public/home-page-routes");
const publicAboutPageRoutes = require("./public/about-page-routes");
const publicContactPageRoutes = require("./public/contact-page-routes");
const publicCategoryRoutes = require("./public/category-routes");
const publicProductRoutes = require("./public/product-routes");
const publicContentRoutes = require("./public/content-routes");
const publicContectMessageRoutes = require("./public/contact-message-routes");
const publicSettingsRoutes = require("./public/settings-routes");
const publicOrdersRoutes = require("./public/order-routes");
const publicPaymentSettingsRoutes = require("./public/payment-setting-routes");
const publicStripeRoutes = require("./public/stripe-payment-routes");

router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/home-page", adminHomePageRoutes);
router.use("/admin/about-page", adminAboutPageRoutes);
router.use("/admin/contact-page", adminContactPageRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/content", adminContentRoutes);
router.use("/admin/contact-messages", adminContectMessageRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/payment-settings", adminPaymentSettingsRoutes);

router.use("/home-page", publicHomePageRoutes);
router.use("/about-page", publicAboutPageRoutes);
router.use("/contact-page", publicContactPageRoutes);
router.use("/categories", publicCategoryRoutes);
router.use("/products", publicProductRoutes);
router.use("/content", publicContentRoutes);
router.use("/contact-message", publicContectMessageRoutes);
router.use("/settings", publicSettingsRoutes);
router.use("/orders", publicOrdersRoutes);
router.use("/payment-settings", publicPaymentSettingsRoutes);
router.use("/stripe", publicStripeRoutes);

module.exports = router;