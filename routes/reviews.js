const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
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

//Reviews
//Post route
router.post(
  "/listings/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const newReview = new Review(req.body.review);
      newReview.author = req.user._id;
      await newReview.save();

      await Listing.findByIdAndUpdate(id, {
        $push: { reviews: newReview._id },
      });

      req.flash("success", "Review posted!");
      res.redirect(`/listings/${id}`);
    } catch (err) {
      next(err);
    }
  })
);

//Review Delete Route
router.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  wrapAsync(isReviewAuthor),
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

// GET route to display all reviews for a listing
router.get(
  "/listings/:id/reviews",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("reviews");
    if (!listing) {
      return res
        .status(404)
        .render("error.ejs", { message: "Listing not found" });
    }
    res.render("listings/reviews", { listing });
  })
);

module.exports = router;
