const { default: mongoose } = require("mongoose");
const moongose = require("mongoose");
const Schema = moongose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  }, //username and password(hashed and salted) are automatically added by passport-local-monggose so we are not adding their fields here
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
