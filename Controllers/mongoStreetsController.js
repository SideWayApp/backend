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

const updateStreet = async (streetName, newStreet) => {
  try {
    console.log(`Updating street "${streetName}":`, newStreet);
    const result = await Street.updateOne({ name: streetName }, newStreet);
    console.log(`Updated street "${streetName}":`, result);
    return result;
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
    console.log("streetNames", streetNames.length);
    const streets = await Street.find({
      name: { $regex: new RegExp(streetNames.join("|"), "i") },
    });
    const matchedStreets = [];
    for (const street of streets) {
      matchedStreets.push(street.name);
    }
    const uniqueNames = [
      ...streetNames.filter((name) => !matchedStreets.includes(name)),
    ];
    console.log("unmached streets", uniqueNames.length);
    const formattedStreets = await pushStreets(uniqueNames, "Tel Aviv");
    createStreets(formattedStreets);
    const totalScore = streets.reduce((acc, street) => acc + street[field], 0);
    console.log(`Total score for ${field} in streets:`, totalScore);
    return totalScore;
  } catch (err) {
    console.error(err);
  }
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
    const streets = await Street.find({});
    const street = streets[50].total;
    // street.total =
    //   (street.clean + street.safe + street.accessible + street.scenery) / 4;
    // await Street.updateOne({ _id: street._id }, street);
    console.log("street", street);
    // for (const street of streets) {
    //   // street.total = (street.clean + street.safe + street.accessible + street.scenery)/4;
    //   await street.save();
    //   console.log("street", street);
    // }
  } catch (err) {
    console.error(err);
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
