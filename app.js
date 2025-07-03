const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing")
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require('ejs-mate');


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


main()
  .then(() => console.log("Connection to MongoDB Successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}


app.listen(PORT, () => console.log("app is listening on Port 8080"));


app.get("/", (req, res) => {
  res.send("root is working");
});

//Index Route
app.get("/listings", wrapAsync(async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    console.error(err);
    next(err);
  }
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
}); 

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
  }
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
  } catch (err) {
    console.error(err);
  }
}));

//Create Route
app.post("/listings", wrapAsync (async (req, res, next) => {
  let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body.listing, { new: true });
    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating listing");
  }
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting listing");
  }
}));

app.all("*", (req, res ,next) => {
  next(new ExpressError(404, "Page Not Found"));
});


//Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});