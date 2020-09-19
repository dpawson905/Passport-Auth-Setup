const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
  asyncErrorHandler,
  isNotAuthenticated,
  isAuthenticated,
  isVerified,
  isNotVerified,
  validatePassword,
} = require("../middleware/index");

router
  .route("/register")
  .get(isAuthenticated, authController.getRegister)
  .post(
    isAuthenticated,
    validatePassword,
    asyncErrorHandler(authController.postRegister)
  );

router
  .route("/login")
  .get(isAuthenticated, authController.getLogin)
  .post(
    isAuthenticated,
    asyncErrorHandler(isNotVerified),
    asyncErrorHandler(authController.postLogin)
  );

router
  .route("/resend-token")
  .get(
    isAuthenticated,
    asyncErrorHandler(isVerified),
    authController.getResendToken
  )
  .post(
    isAuthenticated,
    asyncErrorHandler(isVerified),
    asyncErrorHandler(authController.postResendToken)
  );

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
  validatePassword,
  asyncErrorHandler(authController.patchChangePassword)
);
router.get("/logout", isNotAuthenticated, authController.logOut);

module.exports = router;
