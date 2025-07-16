const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");

// Middleware to validate review data
const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
      let errorMessage = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errorMessage);
    }else{
      next();
    }
  };
  
  //Reviews
  //Post route
  router.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
    try {
      let listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      let newReview = new Review(req.body.review);
      await newReview.save();
      listing.reviews.push(newReview._id);
      await listing.save();
  
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      next(err); 
    }
  }));
  
  //Review Delete Route
  router.post("/listings/:id/reviews/:reviewId", wrapAsync(async (req,res) => {
    try {
      const { id, reviewId } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      await Review.findByIdAndDelete(reviewId);
      listing.reviews = listing.reviews.filter((review) => review.toString() !== reviewId);
      await listing.save();
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting review");
    }
  }));

  // GET route to display all reviews for a listing
  router.get("/listings/:id/reviews", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('reviews');
    if (!listing) {
      return res.status(404).render("error.ejs", { message: "Listing not found" });
    }
    res.render("listings/reviews", { listing });
  }));

  module.exports = router;