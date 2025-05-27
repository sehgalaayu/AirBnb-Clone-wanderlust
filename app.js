const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8080;
const MONOGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing")
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

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

//Show Route
app.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
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