const Street = require("../models/Street");
const { pushStreets } = require("../Controllers/scraperController");

const getAllStreets = async () => {
  try {
    const results = await Street.find({});
    return results;
  } catch (err) {
    console.error(err);
  }
};

const getSingleStreet = async (streetName) => {
  try {
    const result = await Street.findOne({ name: streetName });
    console.log(`Retrieved street "${streetName}":`, result);
    return result;
  } catch (err) {
    console.error(err);
  }
};

const deleteStreet = async (streetName) => {
  try {
    const result = await Street.deleteOne({ name: streetName });
    console.log(`Deleted street "${streetName}":`, result);
    return result;
  } catch (err) {
    console.error(err);
  }
};

const updateStreet = async (streetName, newStreetValue) => {
  try {
    const street = await Street.findOne({ name: streetName });
    if (!street) {
      throw new Error(`Street '${streetName}' not found`);
    }

    if (newStreetValue.scenery !== undefined) {
      street.scenery.push({ score: newStreetValue.scenery });
    }

    if (newStreetValue.accessible !== undefined) {
      street.accessible.push({ score: newStreetValue.accessible });
    }

    if (newStreetValue.safe !== undefined) {
      street.safe.push({ score: newStreetValue.safe });
    }

    if (newStreetValue.clean !== undefined) {
      street.clean.push({ score: newStreetValue.clean });
    }

    await street.save();

    return street;
  } catch (err) {
    console.error(err);
  }
};

const createStreets = async (streets) => {
  const arr = [];
  await Promise.all(
    streets.map(async (element) => {
      console.log(`Creating street "${element.name}":`, element);
      if (element.name != null && element.name != "") {
        const street = await createStreet(element);
        arr.push(street);
      }
    })
  );

  return arr;
};

const createStreet = async (street) => {
  try {
    const ret = await new Street(street).save();
    return ret;
  } catch (err) {
    throw err;
  }
};

const getTotalScoreForStreets = async (streetNames, field) => {
  try {
    console.log(streetNames);
    const streets = await Street.find({
      name: { $regex: new RegExp(streetNames.join("|"), "i") },
    });
    if (field === "total") {
      let totalScore = 0;
      for (const street of streets) {
        totalScore += street[field];
      }
      console.log("totalScore:", totalScore);
      return totalScore;
    } else {
      const totalScore = streets.reduce((sum, street) => {
        if (Array.isArray(street[field])) {
          const fieldSum = street[field].reduce(
            (scoreSum, scoreObj) => scoreSum + scoreObj.score,
            0
          );
          return sum + fieldSum;
        } else {
          return sum;
        }
      }, 0);
      console.log("totalScore", totalScore);
      return totalScore;
    }
  } catch (err) {
    console.error(err);
  }
};

const findUniqueStreets = async (streetNames) => {
  const matchedStreets = [];
  for (const street of streets) {
    matchedStreets.push(street.name);
  }
  const uniqueNames = [
    ...streetNames.filter((name) => !matchedStreets.includes(name)),
  ];
  console.log("unmached streets", uniqueNames);
  const formattedStreets = await pushStreets(uniqueNames, "Tel Aviv");
  createStreets(formattedStreets);
};

async function removeDuplicates() {
  const pipeline = [
    {
      $group: {
        _id: { name: "$name", city: "$city" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ];

  const duplicates = await Street.aggregate(pipeline).exec();

  for (const duplicate of duplicates) {
    const idsToRemove = duplicate.ids.slice(1);
    await Street.deleteMany({ _id: { $in: idsToRemove } });
  }

  console.log(`Removed ${duplicates.length} duplicates.`);
  return duplicates;
}

const removeTotalScoreForStreets = async (streetNames) => {
  try {
    const streets = await Street.find({});

    for (const street of streets) {
      if (street.total != undefined) {
        street.total = undefined;
        console.log("street", street);
        await street.save();
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const updateVirtualScore = async () => {
  try {
    await Street.updateMany(
      {},
      {
        $set: {
          clean: [],
          safe: [],
          scenery: [],
          accessible: [],
        },
      },
      { strict: false }
    );
    console.log("Old street schema objects updated successfully");
  } catch (err) {
    console.log("Error updating old street schema objects: ", err);
  }
};

module.exports = {
  getAllStreets,
  getSingleStreet,
  deleteStreet,
  updateStreet,
  createStreets,
  createStreet,
  getTotalScoreForStreets,
  removeDuplicates,
  removeTotalScoreForStreets,
  updateVirtualScore,
};
