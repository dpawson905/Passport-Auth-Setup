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
  checkForEmail,
  validateEmail
} = require("../middleware/index");

router
  .route("/register")
  .post(
    isAuthenticated,
    validatePassword,
    asyncErrorHandler(checkForEmail),
    asyncErrorHandler(validateEmail),
    asyncErrorHandler(authController.postRegister)
  );

router
  .route("/login")
  .post(isAuthenticated, asyncErrorHandler(isNotVerified), asyncErrorHandler(authController.postLogin));

router
  .route("/forgot-password")
  .get(isAuthenticated, authController.getForgotPassword)
  .post(isAuthenticated, asyncErrorHandler(authController.postForgotPassword));

router.post(
  "/token",
  isAuthenticated,
  asyncErrorHandler(authController.verifyFromText)
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
