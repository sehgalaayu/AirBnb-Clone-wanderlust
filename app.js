const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const { listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/reviews");



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

app.use("/listings", listingRoutes);
app.use("/", reviewRoutes);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});
