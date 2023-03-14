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
});

// Define a virtual field for the 'total' score
streetSchema.virtual("total").get(function () {
  const sum = this.clean + this.safe + this.scenery + this.accessible;
  return sum / 4;
});

const Street = mongoose.model("Street", streetSchema);

module.exports = Street;
