const MapItem = require("../Models/MapItem");

// Function to add a new map item
const addMapItem = async (type, streetName, city, x, y) => {
  try {
    const newItem = new MapItem({ type, streetName, city, x, y });
    const result = await newItem.save();
    return result;
  } catch (err) {
    throw err;
  }
};

// Function to update a map item by its id
const updateMapItem = async (id, updates) => {
  try {
    const result = await MapItem.findByIdAndUpdate(id, updates, { new: true });
    return result;
  } catch (err) {
    throw err;
  }
};

// Function to delete a map item by its id
const deleteMapItem = async (id) => {
  try {
    const result = await MapItem.findByIdAndDelete(id);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to get a map item by its type
const getMapItemsByType = async (type, city) => {
  try {
    const result = await MapItem.find({ type: type, city: city });
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to get all map items
const getAllMapItemsByCity = async (city) => {
  try {
    const items = await MapItem.find({ city: city });
    return items;
  } catch (error) {
    throw error;
  }
};

const getMapItemsByRegion = async (region) => {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  const minLatitude = latitude - latitudeDelta / 2;
  const maxLatitude = latitude + latitudeDelta / 2;
  const minLongitude = longitude - longitudeDelta / 2;
  const maxLongitude = longitude + longitudeDelta / 2;

  const items = await MapItem.find({
    y: { $gte: minLatitude, $lte: maxLatitude },
    x: { $gte: minLongitude, $lte: maxLongitude },
  });
  return items;
};

module.exports = {
  addMapItem,
  updateMapItem,
  deleteMapItem,
  getMapItemsByType,
  getAllMapItemsByCity,
  getMapItemsByRegion,
};
