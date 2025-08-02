if (process.env.NODE_ENV != "production") {
  require("dotenv").config(); //if not development phase use dotenv
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user.js");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Session configuration
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
      secret: process.env.SESSION_SECRET || "aayuiscool"
    },
    touchAfter: 24 * 3600, // Only update session once per day
    ttl: 14 * 24 * 3600 // Session TTL (14 days)
  }),
  secret: process.env.SESSION_SECRET || "aayuiscool",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: false, // Set to false for now to test
    sameSite: "lax" // Use lax for better compatibility
  },
  name: 'sessionId' // Custom session name
};

app.use(session(sessionConfig));
app.use(flash());

main()
  .then(() => console.log("Connection to MongoDB Successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.listen(PORT, () => console.log(`app is listening on Port ${PORT}`));

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Test route for flash messages
app.get("/test-flash", (req, res) => {
  req.flash("success", "This is a test success message!");
  req.flash("error", "This is a test error message!");
  res.redirect("/listings");
});

// Debug route to check environment and session
app.get("/debug", (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasJwtSecret: !!process.env.JWT_SECRET,
    sessionId: req.sessionID,
    flashSuccess: req.flash("success"),
    flashError: req.flash("error"),
    sessionStore: req.sessionStore ? "MongoDB" : "Memory"
  });
});

// Debug route to check authentication
app.get("/debug-auth", (req, res) => {
  const token = req.cookies.token;
  res.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    user: res.locals.user,
    cookies: req.cookies
  });
});

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
      const decoded = jwt.verify(token, JWT_SECRET);
      res.locals.user = decoded;
      console.log("✅ User authenticated:", decoded.username);
    } catch (err) {
      console.log("❌ JWT verification failed:", err.message);
      res.locals.user = null;
      res.clearCookie("token"); // Clear invalid token
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listingRoutes);
app.use("/", reviewRoutes);
app.use("/", userRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});
