const { cloudinary } = require("../cloudinary");
const User = require("../models/userModel");

const middleware = {
  asyncErrorHandler: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("error", "You are currently logged in.");
      res.redirect("/");
    } else {
      return next();
    }
  },
  isNotAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error", "You are not authenticated");
      req.session.redirectTo = req.originalUrl;
      res.redirect("/auth/login");
    }
  },
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.roles.admin) {
      return next();
    }
    req.flash("error", "You don't have the privileges to do that.");
    res.redirect("/auth/login");
  },
  deleteProfileImage: async (req) => {
    if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
  },
  isVerified: async (req, res, next) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user.isVerified) {
      return next();
    }
    req.flash("error", "Your account is already active.");
    res.redirect("/");
  },
  isNotVerified: async (req, res, next) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user.isVerified) {
      req.flash("error", "Your account is not active.");
      res.redirect("/");
    }
    return next();
  },

  validatePassword: (req, res, next) => {
    const userInfo = req.body;
    if (userInfo.password !== userInfo.password2) {
      const error = "Sorry, passwords must match.";
      return res.render("auth/register", {
        error,
        userInfo,
        url: "register",
      });
    }
    next();
  },
};

module.exports = middleware;
