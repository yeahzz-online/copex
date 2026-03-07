const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  authorizeSmartboardSessionByFaculty,
  completeStudentSetup,
  createSmartboardSession,
  exchangeSmartboardSession,
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
  requestSmartboardOtp,
  resendRegistrationOtp,
  verifyRegistrationOtp,
  verifySmartboardOtp
} = require("../controllers/authController");
const { ROLES } = require("../config/constants");
const authorizeRoles = require("../middlewares/authorizeRoles");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts, please try again later."
  }
});

router.post("/register", register);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/resend-otp", resendRegistrationOtp);
router.post("/student-setup", completeStudentSetup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/login", loginLimiter, login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

router.post("/smartboard/session", createSmartboardSession);
router.post(
  "/smartboard/authorize",
  verifyJWT,
  authorizeRoles(ROLES.FACULTY),
  authorizeSmartboardSessionByFaculty
);
router.post("/smartboard/request-otp", requestSmartboardOtp);
router.post("/smartboard/verify-otp", verifySmartboardOtp);
router.post("/smartboard/exchange", exchangeSmartboardSession);

module.exports = router;
