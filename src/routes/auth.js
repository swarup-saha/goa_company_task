const express = require("express");
const {
  createNewUser,
  loginUser,
  verifyPhoneOtp,
  createMobileOtp,
  createEmailOtp,
  verifyEmail,
} = require("../controllers/auth");
const router = express.Router();

router.post("/register", createNewUser);
router.post("/mobile/otp", createMobileOtp);
router.post("/email/otp", createEmailOtp);
router.post("/verify/mobile", verifyPhoneOtp);
router.post("/verify/email", verifyEmail);
router.post("/login", loginUser);

module.exports = router;
