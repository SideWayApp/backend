const mongoose = require("mongoose");

const mapItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  hebrew: {
    type: String,
    required: false,
  },
  formattedStreetName: {
    type: String,
    required: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  city: {
    type: String,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  exists: {
    type: Boolean,
    required: true,
  },
});


const MapItem = mongoose.model("MapItem", mapItemSchema);

module.exports = MapItem;
