const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    await User.register(user, password); // passport-local-mongoose handles hashing
    res.redirect("/listings");
  } catch (e) {
    res.render("auth/signup", { error: e.message });
  }
});


module.exports = router;
