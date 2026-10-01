const express = require("express");
const auth = require("../../middleware/authMiddleware");
const {
  getPlans,
  getSubscription,
  createOrder,
  verifyPayment,
  paymentHistory,
} = require("../../controllers/paymentController");

const router = express.Router();

router.get("/plans", getPlans);
router.get("/subscription", auth, getSubscription);
router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/history", auth, paymentHistory);

module.exports = router;
