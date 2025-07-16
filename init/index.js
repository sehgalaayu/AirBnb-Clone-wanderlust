const mongoose = require("mongoose")
const Listing = require("../models/listing.js")
const initData = require("./data.js")

main()
  .then(() => console.log("Connection to MongoDB Successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.1:27017/wanderlust");
  console.log("Connection to MongoDB Successful!")
}

const initDB = async () => {
    await Listing.deleteMany({});
    console.log("All previous listings deleted.");
    await Listing.insertMany(initData.data);
    console.log("New listings added.");
};

initDB()
  .then(() => {
    console.log("Data initialized successfully.");
  })
  .catch((err) => {
    console.error("Error initializing data:", err);

  });