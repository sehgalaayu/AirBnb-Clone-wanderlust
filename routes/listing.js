const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {
  getAllListings,
  renderNewForm,
  showListing,
  renderEditForm,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");
const Listing = require("../models/listing");
const { listingSchemaZod } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.flash("error", "Invalid or expired token. Please log in again.");
    return res.redirect("/login");
  }
}

async function isOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user.id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

// Middleware to validate listing data
const validateListing = (req, res, next) => {
  try {
    listingSchemaZod.parse(req.body);
    next();
  } catch (err) {
    const errorMessage =
      err.errors && err.errors.length > 0
        ? err.errors[0].message
        : "Invalid data";
    throw new ExpressError(400, errorMessage);
  }
};

router
  .route("/")
  .get(wrapAsync(getAllListings))
  .post(
    isLoggedIn,
    upload.single("listing[image]", (req, res) => {
      res.send(req.file);
    }),
    validateListing,
    wrapAsync(createListing)
  );

router.get("/new", isLoggedIn, renderNewForm);

router
  .route("/:id")
  .get((req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(404)
        .render("error.ejs", { message: "Listing not found" });
    }
    next();
  }, wrapAsync(showListing))
  .put(
    isLoggedIn,
    wrapAsync(isOwner),
    validateListing,
    wrapAsync(updateListing)
  )
  .delete(isLoggedIn, wrapAsync(isOwner), wrapAsync(deleteListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(renderEditForm)
);

module.exports = router;
