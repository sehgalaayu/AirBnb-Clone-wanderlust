const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    // Generate JWT
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
  } catch (e) {
    res.render("auth/signup", { error: e.message });
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.render("auth/login", { error: "Invalid username or password." });
  }
  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return res.render("auth/login", { error: "Invalid username or password." });
  }
  // Generate JWT
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
  req.flash("success", "Welcome back!");
  res.redirect("/listings");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("success", "You have logged out.");
  res.redirect("/listings");
});


module.exports = router;
