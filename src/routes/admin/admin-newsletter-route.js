const router = require("express").Router();
const controller = require("../../controllers/admin/admin-newsletter-controller");
const adminAuthMiddleware = require("../../middlewares/admin-auth-middleware");

router.get(
  "/stats",
  adminAuthMiddleware,
  controller.getStats.bind(controller)
);

router.get(
  "/subscribers/all",
  adminAuthMiddleware,
  controller.getSubscribers.bind(controller)
);

router.get(
  "/campaigns/all",
  adminAuthMiddleware,
  controller.getCampaigns.bind(controller)
);

router.post(
  "/send-campaign",
  adminAuthMiddleware,
  controller.sendCampaign.bind(controller)
);

router.put(
  "/subscriber-status/:id",
  adminAuthMiddleware,
  controller.updateSubscriberStatus.bind(controller)
);

router.delete(
  "/subscriber/:id",
  adminAuthMiddleware,
  controller.removeSubscriber.bind(controller)
);

module.exports = router;