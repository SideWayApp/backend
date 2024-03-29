const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: {
    type:[String]
  },
  preferences: {
    accessibility: {
      type: Boolean,
      default: false
    },
    clean: {
      type: Boolean,
      default: false
    },
    scenery: {
      type: Boolean,
      default: false
    },
    security: {
      type: Boolean,
      default: false
    },
    speed: {
      type: Boolean,
      default: false
    },
  },
  signUpData: {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
  },
  favorites:{
    type: [String],
  },
  recents:{
    type:[String]
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;