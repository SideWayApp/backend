const MapItem = require("../Models/MapItem");

// Function to add a new map item
const addMapItem = async (type, hebrew, streetName, city, x, y) => {
  try {
    const newItem = new MapItem({ type, hebrew, streetName, city, x, y });
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

// Function to delete a map item by street name
const deleteMapItemByStreetName = async (streetName) => {
  try {
    const result = await MapItem.findOneAndDelete({ streetName });
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to get a map item by its type
const getMapItemsByType = async (type) => {
  try {
    const result = await MapItem.find({ type: type });
    return result.map((item) => ({ x: item.x, y: item.y }));
  } catch (error) {
    throw error;
  }
};

// Function to get all map items
const getAllMapItemsByCity = async (city) => {
  try {
    const items = await MapItem.find({ city: city }).limit(1000);
    return items;
  } catch (error) {
    throw error;
  }
};

const getMapItemsByRegion = async (region, preferences) => {
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

const getAllTypes = async () => {
  const types = await MapItem.distinct("type");
  return types;
};

const countTypes = async () => {
  const count = await MapItem.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);
  return count;
};

const getDuplicateCoordinates = async (type) => {
  const items = await MapItem.find({ type: type });

  const coordinatesMap = new Map();

  const duplicates = [];

  for (const item of items) {
    const { x, y } = item;

    if (coordinatesMap.has(`${x},${y}`)) {
      duplicates.push(item);
    } else {
      coordinatesMap.set(`${x},${y}`, true);
    }
  }

  // Return the array of duplicates
  return duplicates;
};

module.exports = {
  addMapItem,
  updateMapItem,
  deleteMapItem,
  getMapItemsByType,
  getAllMapItemsByCity,
  getMapItemsByRegion,
  getAllTypes,
  countTypes,
  getDuplicateCoordinates,
};
