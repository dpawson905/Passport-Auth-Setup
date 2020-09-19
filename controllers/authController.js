const debug = require("debug")("auth-starter:auth");
const passport = require("passport");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Email = require("../utils/email");

const User = require("../models/userModel");
const Token = require("../models/tokenModel");

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    url: "register",
    userInfo: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
    },
  });
};

exports.postRegister = async (req, res, next) => {
  const userInfo = req.body;
  try {
    const newUser = new User({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      username: userInfo.username,
      expiresDateCheck: Date.now(),
      isVerified: false,
    });
    if (userInfo.password !== userInfo.password2) {
      const error = "Sorry, passwords must match.";
      return res.render("auth/register", {
        error,
        userInfo,
        url: "register",
      });
    }
    delete userInfo.password2;
    const user = await User.register(newUser, userInfo.password);
    const userToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await userToken.save();
    const url = `${req.protocol}://${req.headers.host}/auth/token?token=${userToken.token}`;
    const title = res.locals.title;
    await new Email(user, url).sendWelcome(title);
    req.flash(
      "success",
      "Thanks for registering, Please check your email to verify your account."
    );
    return res.redirect("/");
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      const error = "Sorry, this email address is already in use.";
      return res.render("auth/register", {
        error,
        userInfo,
        url: "register",
      });
    } else {
      console.log(err);
      const error = err.message;
      return res.render("auth/register", {
        error,
        userInfo,
        url: "register",
      });
    }
  }
};

exports.verifyFromEmail = async (req, res, next) => {
  const token = await Token.findOne({
    token: req.query.token,
  });
  if (!token) {
    req.flash("error", "That token is not valid");
    return res.redirect("/");
  }
  const user = await User.findOne({ _id: token._userId });
  console.log(user);
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

exports.getLogin = (req, res, next) => {
  res.render("auth/login", { url: "login" });
};

exports.postLogin = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user.isVerified) {
    const error =
      "You have not validated your account. Please check your email or request your token here.";
    return res.render("auth/resendToken", { error });
  }
  await passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    successFlash: `Welcome back ${user.username}`,
    failureFlash: true,
  })(req, res, next);
};

exports.logOut = (req, res, next) => {
  req.logout();
  return res.redirect("/");
};

exports.getResendToken = (req, res, next) => {
  res.render("auth/resendToken");
};

exports.postResendToken = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash(
      "error",
      "Sorry, it looks like this account does not exist. Create a new account using the same email address."
    );
    return res.redirect("/auth/register");
  }
  const token = await Token.findOne({ _userId: user._id });

  if (!token) {
    const newToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await newToken.save();
    const url = `${req.protocol}://${req.headers.host}/auth/token?token=${newToken.token}`;
    await new Email(user, url).resendToken();
    req.flash("success", "Your token has been sent to your email.");
    return res.redirect("/");
  } else {
    const url = `${req.protocol}://${req.headers.host}/auth/token?token=${token.token}`;
    await new Email(user, url).resendToken();
    req.flash("success", "Your token has been sent to your email.");
    return res.redirect("/");
  }
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
  const url = `${req.protocol}://${req.headers.host}/auth/newpw-token?token=${newToken.token}`;
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
