const Listing = require("../models/listing");
const { listingSchemaZod } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");

// List all listings
const getAllListings = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("./listings/index", { allListings });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Render new listing form
const renderNewForm = (req, res) => {
  res.render("./listings/new");
};

// Show a single listing
const showListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: { path: "author", select: "username" },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
  }
};

// Render edit form
const renderEditForm = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  } catch (err) {
    console.error(err);
  }
};

// Create a new listing
const createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url + " " + filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user.id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Listing Created successfully!");
  res.redirect("/listings");
};

// Update a listing
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Handle image update
    if (req.file) {
      // New file uploaded
      const url = req.file.path;
      const filename = req.file.filename;
      req.body.listing.image = { url, filename };
    } else if (req.body.listing.image && req.body.listing.image.url) {
      // URL provided but no file uploaded
      req.body.listing.image = { 
        url: req.body.listing.image.url,
        filename: listing.image ? listing.image.filename : null 
      };
    } else {
      // No new image provided, keep existing image
      req.body.listing.image = listing.image;
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
    );
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating listing");
  }
};

// Delete a listing
const deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting listing");
  }
};

module.exports = {
  getAllListings,
  renderNewForm,
  showListing,
  renderEditForm,
  createListing,
  updateListing,
  deleteListing,
};
