const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");

// Middleware to validate listing data
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    console.log(error);
    if (error) {
      let errorMessage = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errorMessage);
    }else{
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
  router.get("/new", (req, res) => {
    res.render("./listings/new");
  });
  
  //Show Route
  router.get(
    "/:id",
    wrapAsync(async (req, res) => {
      try {
        const listing = await Listing.findById(req.params.id).populate('reviews');
        res.render("listings/show", { listing });
      } catch (err) {
        console.error(err);
      }
    })
  );
  
  //Edit Route
  router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {
      try {
        const listing = await Listing.findById(req.params.id);
        res.render("listings/edit", { listing });
      } catch (err) {
        console.error(err);
      }
    })
  );
  
  //Create Route
  router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res, next) => {
      const newListing = new Listing(req.body.listing);
      await newListing.save();
      res.redirect("/listings");
    })
  );
  
  //Update Route
  router.put(
    "/:id", validateListing,
    wrapAsync(async (req, res) => {
      try {
        const updatedListing = await Listing.findByIdAndUpdate(
          req.params.id,
          req.body.listing,
          { new: true }
        );
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
    wrapAsync(async (req, res) => {
      try {
        await Listing.findByIdAndDelete(req.params.id);
        res.redirect("/listings");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting listing");
      }
    })
  );
  
  module.exports = router;