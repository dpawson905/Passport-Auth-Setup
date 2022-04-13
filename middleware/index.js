const kickbox = require("kickbox")
  .client(process.env.KICKBOX_API_KEY)
  .kickbox();
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
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
  },

  isVerified: async (req, res, next) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user.isVerified) {
      return next();
    }
    req.flash("error", "Your account is already active.");
    res.redirect("/");
  },

  validatePassword: (req, res, next) => {
    const userInfo = req.body;
    if (userInfo.password !== userInfo.password2) {
      req.flash("error", "Passwords do not match");
      const error = "Sorry, passwords must match.";
      return res.redirect("back");
    }
    next();
  },

  checkForEmail: async(req, res, next) => {
    const registeredUserCheck = await User.findOne({email: req.body.email});
    if (registeredUserCheck) {
      req.flash("error", "This email address is already in use");
      return res.redirect("/");
    }
    next();
  },

  validateEmail: async (req, res, next) => {
    await kickbox.verify(req.body.email, (err, response) => {
      if (err) {
        req.flash("error", "Email Verification Failed. Please try again");
        return res.redirect("/");
      }
      const { result, reason } = response.body;
      if (result === "deliverable" && reason === "accepted_email") {
        next();
      }
    });
  },
};

module.exports = middleware;
