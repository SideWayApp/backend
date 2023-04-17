const mongoose = require("mongoose");

const mapItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  hebrew: {
    type:String,
    required: true,
  },
  streetName: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  city: {
    type: String,
    required: true,
  },
  x:{
    type: String,
    required: true,
  },
  y:{
    type: String,
    required:true,
  },
});

const MapItem = mongoose.model("MapItem", mapItemSchema);

module.exports = MapItem;
