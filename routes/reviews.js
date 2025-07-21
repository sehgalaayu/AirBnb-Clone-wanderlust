const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");
const passport = require("passport");

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
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
  let { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
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
