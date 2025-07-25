const express = require("express");
const router = express.Router();
const { renderSignup, signup, renderLogin, login, logout } = require("../controllers/userController");

router.route("/signup")
  .get(renderSignup)
  .post(signup);

router.route("/login")
  .get(renderLogin)
  .post(login);

router.get("/logout", logout);

module.exports = router;
