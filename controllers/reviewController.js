const Listing = require("../models/listing.js");
const { reviewSchemaZod } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");

// Post a new review
const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newReview = new Review(req.body.review);
    newReview.author = req.user.id;
    await newReview.save();
    await Listing.findByIdAndUpdate(id, {
      $push: { reviews: newReview._id },
    });
    req.flash("success", "Review posted!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};

// Get all reviews for a listing
const getReviewsForListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");
  if (!listing) {
    return res
      .status(404)
      .render("error.ejs", { message: "Listing not found" });
  }
  res.render("listings/reviews", { listing });
};

module.exports = {
  createReview,
  deleteReview,
  getReviewsForListing,
}; 