const debug = require("debug")("app:auth");
const passport = require("passport");

const crypto = require("crypto");
const Email = require("../utils/email");

const emailUrl = require("../utils/urls");
const helpers = require("../utils/helpers");

const User = require("../models/userModel");
const Token = require("../models/tokenModel");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const randomstring = require("random-string-gen");

exports.postRegister = async (req, res, next) => {
  const userInfo = req.body;
  // Middleware runs before to check if passwords match
  // Middleware checks for existing email(bypasses passport email check due to kickbox allowing email check to be bypassed)
  // Passport will check for existing username
  // Middleware runs to verify email with kickbox
  try {
    const newUser = new User({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      image: {
        path: `https://robohash.org/${userInfo.username}?set=set3`
      },
      email: userInfo.email,
      username: userInfo.username,
      expiresDateCheck: Date.now(),
      isVerified: false,
    });
    delete userInfo.password2;
    const user = await User.register(newUser, userInfo.password);
    let textcode = randomstring({
      length: 6,
      type: "numeric",
    });
    await client.messages.create({
      body: `Thanks for registering, here is your verification code: ${textcode}`,
      from: process.env.TWILIO_NUMBER,
      to: req.body.phoneNumber,
    });
    const userToken = new Token({
      _userId: user._id,
      token: textcode,
    });
    await userToken.save();
    req.flash(
      "success",
      "Thanks for registering, Enter the code from the text message..."
    );
    return res.redirect("/?loadtextmodal");
  } catch (err) {
    await helpers.removeFailedUser(User, req.body.email);
    req.flash("error", err.message);
    return res.redirect("back");
  }
};

exports.verifyFromText = async (req, res, next) => {
  const token = await Token.findOne({
    token: req.body.token,
  });
  if (!token) {
    req.flash("error", "That token is not valid");
    return res.redirect("/");
  }
  const user = await User.findOne({ _id: token._userId });
  user.isVerified = true;
  user.expiresDateCheck = undefined;
  await user.save();
  await token.remove();
  await req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", `Welcome to ${res.locals.title} ${user.username}`);
    const redirectUrl = req.session.redirectTo || "/";
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
};

exports.postLogin = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user.isVerified) {
    const error = "You have not verified your account";
    return res.render("auth/login", {
      error,
      userInfo,
      url: "login",
    });
  }
  await passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    successFlash: `Welcome back ${user.username}`,
    failureFlash: true,
  })(req, res, next);
};

exports.logOut = (req, res, next) => {
  req.logout();
  return res.redirect("/");
};

exports.getForgotPassword = (req, res, next) => {
  res.render("auth/forgotPassword");
};

exports.postForgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "Invalid email address");
    return res.redirect("back");
  }
  const newToken = new Token({
    _userId: user._id,
    token: crypto.randomBytes(6).toString("hex"),
  });
  await newToken.save();
  const url = emailUrl.setUrl(
    req,
    "auth",
    `newpw-token?token=${newToken.token}`
  );
  await new Email(user, url).sendPasswordReset();
  req.flash("success", "Please check your email to change your password.");
  return res.redirect("/");
};

exports.getTokenNewPassword = async (req, res, next) => {
  const token = await Token.findOne({ token: req.query.token });
  if (!token) {
    req.flash(
      "error",
      "This token has expired, please send a new password reset request"
    );
    return res.redirect("/auth/forgot-password");
  }
  const user = await User.findById(token._userId);
  const username = user.username;
  return res.render("auth/changePassword", { username });
};

exports.patchChangePassword = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    req.flash("error", "This account is not valid");
    return res.redirect("/");
  }

  await user.setPassword(req.body.password, async (err) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/");
    }
    user.attempts = 0;
    user.expiresDateCheck = undefined;
    const url = `${req.protocol}://${req.headers.host}/auth/login`;
    await new Email(user, url).sendPasswordChange();
    await user.save();
    req.flash(
      "success",
      "Your password has been successfully updated. Please login using your new password"
    );
    res.redirect("/auth/login");
  });
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  await user.setPassword(req.body.password, async (err) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    user.attempts = 0;
    user.expiresDateCheck = null;
    await user.save();
    req.flash("success", "Password has been changed.");
    res.redirect("back");
  });
};
