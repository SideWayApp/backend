const mongoose = require("mongoose");

const streetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  clean: {
    type: Number,
    required: true,
  },
  safe: {
    type: Number,
    required: true,
  },
  scenery: {
    type: Number,
    required: true,
  },
  accessible: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const Street = mongoose.model("Street", streetSchema);

module.exports = Street;
