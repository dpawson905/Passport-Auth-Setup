const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
  asyncErrorHandler,
  isNotAuthenticated,
  isAuthenticated,
  isVerified,
} = require("../middleware/index");

router
  .route("/register")
  .get(isAuthenticated, authController.getRegister)
  .post(isAuthenticated, asyncErrorHandler(authController.postRegister));

router
  .route("/login")
  .get(isAuthenticated, authController.getLogin)
  .post(isAuthenticated, asyncErrorHandler(authController.postLogin));

router
  .route("/resend-token")
  .get(isAuthenticated, authController.getResendToken)
  .post(isAuthenticated, asyncErrorHandler(authController.postResendToken));

router
  .route("/forgot-password")
  .get(isAuthenticated, authController.getForgotPassword)
  .post(isAuthenticated, asyncErrorHandler(authController.postForgotPassword));

router.get(
  "/token",
  isAuthenticated,
  asyncErrorHandler(authController.verifyFromEmail)
);
router.get(
  "/newpw-token",
  isAuthenticated,
  asyncErrorHandler(authController.getTokenNewPassword)
);
router.patch(
  "/change-password",
  isAuthenticated,
  asyncErrorHandler(authController.patchChangePassword)
);
router.get("/logout", isNotAuthenticated, authController.logOut);

module.exports = router;