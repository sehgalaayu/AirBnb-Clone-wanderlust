const Listing = require("../models/listing");
const { listingSchemaZod } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

// Geocoding function using Mapbox API
const geocodeLocation = async (location, country) => {
  try {
    const query = encodeURIComponent(`${location}, ${country}`);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=pk.eyJ1Ijoic2VoZ2FsYWF5dSIsImEiOiJjbWRzczNyeTEwMWYwMmtzaWd5dmVsdmI4In0.DE0varrK5nQbsEKShLJWIg&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lng, lat };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// List all listings
const getAllListings = async (req, res, next) => {
  try {
    let query = {};
    
    // Handle search functionality
    if (req.query.search) {
      const searchTerm = req.query.search;
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { country: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }
    
    const allListings = await Listing.find(query);
    res.render("./listings/index", { allListings, searchTerm: req.query.search });
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
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", JSON.stringify(req.body, null, 2));
    
    let url, filename;
    
    // Handle file upload or URL input
    if (req.file) {
      // File uploaded
      url = req.file.path;
      filename = req.file.filename;
      console.log("File uploaded:", url + " " + filename);
    } else if (req.body.imageUrl && req.body.imageUrl.trim() !== '') {
      // URL provided
      url = req.body.imageUrl.trim();
      filename = null;
      console.log("Image URL provided:", url);
    } else {
      // No file or URL provided, use default image
      url = "https://images.unsplash.com/photo-1535448033526-c0e85c9e6968?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      filename = null;
      console.log("No file or URL provided, using default image");
    }
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user.id;
    newListing.image = { url, filename };
    
    // Geocode the location
    const coordinates = await geocodeLocation(newListing.location, newListing.country);
    if (coordinates) {
      newListing.geometry = {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      };
    }
    
    await newListing.save();
    req.flash("success", "Listing Created successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error in createListing:", err);
    next(err);
  }
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
    } else if (req.body.imageUrl && req.body.imageUrl.trim() !== '') {
      // URL provided but no file uploaded
      req.body.listing.image = { 
        url: req.body.imageUrl.trim(),
        filename: listing.image ? listing.image.filename : null 
      };
    } else {
      // No new image provided, keep existing image
      req.body.listing.image = listing.image;
    }

    // Geocode the location if it changed
    if (req.body.listing.location !== listing.location || req.body.listing.country !== listing.country) {
      const coordinates = await geocodeLocation(req.body.listing.location, req.body.listing.country);
      if (coordinates) {
        req.body.listing.geometry = {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        };
      }
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
