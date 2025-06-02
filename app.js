const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8080;
const MONOGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

main()
  .then(() => console.log("Connection to MongoDB Successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONOGO_URL);
}


app.listen(PORT, () => console.log("app is listening on Port 8080"));


app.get("/", (req, res) => {
  res.send("root is working");
});

//Index Route
app.get("/listings", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    console.error(err);
  }
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
}); 

//Show Route
app.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
  }
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
  } catch (err) {
    console.error(err);
  }
});

//Create Route
app.post("/listings", async (req, res) => {
  let newListing = new Listing(req.body.listing);
  try {
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving listing");
  }
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body.listing, { new: true });
    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating listing");
  }
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting listing");
  }
});


// app.get("/testListing" , async (req,res)=>{
//   const sampleListing = new Listing({
//     title: "Luxury Fort In Edinburgh, Scotland",
//     description: "Very luxury located at countryside Scotland",
//     price: 150,
//     location: "Scotland",
//     country : "UK"
//   })

//   await sampleListing.save();
//   console.log("Sample Listing was saved.")
//   res.send("suceessful testing.")
// })