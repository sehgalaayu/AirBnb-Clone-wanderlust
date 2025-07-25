const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { createReview, deleteReview, getReviewsForListing } = require("../controllers/reviewController");
const Listing = require("../models/listing.js");
const { reviewSchemaZod } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

async function isReviewAuthor(req, res, next) {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author || !review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to perform this action.");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

// Middleware to validate review data
const validateReview = (req, res, next) => {
  try {
    reviewSchemaZod.parse(req.body);
    next();
  } catch (err) {
    const errorMessage = err.errors && err.errors.length > 0 ? err.errors[0].message : "Invalid data";
    throw new ExpressError(400, errorMessage);
  }
};

router.route("/listings/:id/reviews")
  .get(wrapAsync(getReviewsForListing))
  .post(isLoggedIn, validateReview, wrapAsync(createReview));

router.route("/listings/:id/reviews/:reviewId")
  .delete(isLoggedIn, wrapAsync(isReviewAuthor), wrapAsync(deleteReview));

module.exports = router;
