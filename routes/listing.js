const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");
const passport = require("passport");

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
}

async function isOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

// Middleware to validate listing data
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    try {
      const allListings = await Listing.find({});
      res.render("./listings/index", { allListings });
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
);

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listings/new");
});

//Show Route with ObjectId validation
router.get(
  "/:id",
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render("error.ejs", { message: "Listing not found" });
    }
    next();
  },
  wrapAsync(async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate({
          path: "reviews",
          populate: { path: "author" }
        })
        .populate("owner");
      if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
      }
      res.render("listings/show", { listing, user: req.user });
    } catch (err) {
      console.error(err);
    }
  })
);

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
      }
      res.render("listings/edit", { listing });
    } catch (err) {
      console.error(err);
    }
  })
);

//Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing Created successfully!");
    res.redirect("/listings");
  })
);

//Update Route
router.put(
  "/:id",
  isLoggedIn,
  wrapAsync(isOwner),
  validateListing,
  wrapAsync(async (req, res) => {
    try {
      const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id,
        req.body.listing,
        { new: true }
      );
      req.flash("success", "Listing Updated!");
      res.redirect(`/listings/${updatedListing._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating listing");
    }
  })
);

//Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(async (req, res) => {
    try {
      await Listing.findByIdAndDelete(req.params.id);
      req.flash("success", "Listing deleted successfully!");
      res.redirect("/listings");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting listing");
    }
  })
);

module.exports = router;
