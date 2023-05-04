const MapItem = require("../Models/MapItem");
const { getAddressFromLatLngMapItem } = require("./directionsContorller");
// Function to add a new map item
const addMapItem = async (
  type,
  hebrew,
  formattedStreetName,
  city,
  longitude,
  latitude
) => {
  try {
    const newItem = new MapItem({
      type,
      hebrew,
      formattedStreetName,
      city,
      longitude,
      latitude,
    });
    const result = await newItem.save();
    return result;
  } catch (err) {
    throw err;
  }
};

async function countStreetNamesByType(mapItems) {
  const result = {};

  for (const mapItem of mapItems) {
    if (!result[mapItem.formattedStreetName]) {
      result[mapItem.formattedStreetName] = {};
    }
    if (!result[mapItem.formattedStreetName][mapItem.type]) {
      result[mapItem.formattedStreetName][mapItem.type] = 1;
    } else {
      result[mapItem.formattedStreetName][mapItem.type]++;
    }
  }

  return result;
}

const getMapItemsPerStreet = async () => {
  try {
    const mapItems = await MapItem.find({});
    // Count the street names by type
    const result = await countStreetNamesByType(mapItems);
    return result;
  } catch (error) {
    console.log(error);
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

const getAllNoneAddressedMapItem = async (type) => {
  try {
    let arr = [];
    const result = await MapItem.find({ type: type });
    for (let i = 0; i < 2; i++) {
      const address = await getAddressFromLatLngMapItem(
        result[i].y,
        result[i].x
      );
      let isAddressInArr = false;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].address === address) {
          isAddressInArr = true;
          break;
        }
      }
      if (!isAddressInArr) {
        arr.push({ address: address });
      }
    }
    return arr;
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

const getTypesFromPrefrences = async (preferences) => {
  const allTypes = {
    Beaches: "Beaches",
    Camera: "Camera",
    DangerousBuildings: "Dangerous Buildings",
    Defibrillator: "Defibrillator",
    Fountain: "Fountain",
    LightPost: "Light Post",
    MADAStation: "MADA Station",
    Museum: "Museum",
    PollutedArea: "Polluted Area",
    PublicShelter: "Public Shelter",
    PublicWIFIHotspots: "Public WIFI Hotspots",
  };
  const selectedTypes = new Set();

  for (let key in preferences) {
    if (preferences[key]) {
      switch (key) {
        case "accessibility":
          selectedTypes
            .add(allTypes.Defibrillator)
            .add(allTypes.DangerousBuildings)
            .add(allTypes.Camera);
          break;
        case "clean":
          selectedTypes
            .add(allTypes.Fountain)
            .add(allTypes.Museum)
            .add(allTypes.Beaches)
            .add(allTypes.Camera);
          break;
        case "scenery":
          selectedTypes
            .add(allTypes.Beaches)
            .add(allTypes.Museum)
            .add(allTypes.Fountain)
            .add(allTypes.Camera);
          break;
        case "security":
          selectedTypes
            .add(allTypes.PublicShelter)
            .add(allTypes.MADAStation)
            .add(allTypes.Camera);
          break;
        case "speed":
          selectedTypes
            .add(allTypes.Camera)
            .add(allTypes.LightPost)
            .add(allTypes.Camera);
          break;
        default:
          console.log("Unknown preference.");
          break;
      }
    }
  }
  return selectedTypes;
};

const getMapItemsByRegion = async (region, preferences) => {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  const minLatitude = latitude - latitudeDelta / 2;
  const maxLatitude = latitude + latitudeDelta / 2;
  const minLongitude = longitude - longitudeDelta / 2;
  const maxLongitude = longitude + longitudeDelta / 2;

  const types = await getTypesFromPrefrences(preferences);

  const items = await MapItem.find({
    latitude: { $gte: minLatitude, $lte: maxLatitude },
    longitude: { $gte: minLongitude, $lte: maxLongitude },
    type: { $in: Array.from(types) },
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
    const { longitude, latitude } = item;

    if (coordinatesMap.has(`${longitude},${latitude}`)) {
      duplicates.push(item);
    } else {
      coordinatesMap.set(`${longitude},${latitude}`, true);
    }
  }

  // Return the array of duplicates
  return duplicates;
};

const groupItemsWithinRadius = async (type) => {
  const items = await MapItem.aggregate([
    {
      $match: {
        type: type, // match only items of the specified type
      },
    },
    {
      $group: {
        _id: {
          type: type,
          longitude: { $trunc: [{ $toDouble: "$longtitude" }, 4] },
          latitude: { $trunc: [{ $toDouble: "$latitude" }, 4] },
        },
        items: { $push: "$$ROOT" },
      },
    },
  ]);

  const ret = items
    .filter((item) => item.items.length > 1)
    .sort((a, b) => b.items.length - a.items.length);
  return ret;
};

const groupItemsByStreet = async (type) => {
  try {
    const items = await MapItem.aggregate([
      {
        $match: {
          type: type, // match only items of the specified type
        },
      },
      {
        $group: {
          _id: "$formattedStreetName", // group by the hebrew field
          items: { $push: "$$ROOT" }, // add all matching documents to an array
        },
      },
    ]);
    const ret = items
      .filter((item) => item.items.length > 1)
      .sort((a, b) => b.items.length - a.items.length);
    return ret;
  } catch (err) {
    console.log(err);
  }
};

const deleteDuplicateItems = async (type) => {
  const items = await groupItemsByStreet(type);
  console.log(items.length);
  items.forEach((item) => {
    for (let i = 1; i < item.items.length; i++) {
      const doc = item.items[i];
    }
  });

  return [];
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
  getMapItemsPerStreet,
  getAllNoneAddressedMapItem,
  getDuplicateCoordinates,
  groupItemsWithinRadius,
  groupItemsByStreet,
  deleteDuplicateItems,
};
