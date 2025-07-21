const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const User = require("../models/user.js"); // Require the User model

main()
  .then(() => console.log("Connection to MongoDB Successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.1:27017/wanderlust");
}

const initDB = async () => {
  // Clear existing data
  await Listing.deleteMany({});
  await User.deleteMany({}); // Optional: clear users as well

  // Create a new user
  const owner = new User({
    username: "defaultOwner",
    email: "owner@example.com",
  });
  const registeredOwner = await User.register(owner, "password");

  // Add owner to each listing
  const listingsWithOwner = initData.data.map((listing) => ({
    ...listing,
    owner: registeredOwner._id,
  }));

  // Insert listings
  await Listing.insertMany(listingsWithOwner);
  console.log("New listings with owner added.");
};

initDB()
  .then(() => {
    console.log("Data initialized successfully.");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error initializing data:", err);
    mongoose.connection.close();
  });