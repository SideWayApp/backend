const Street = require("../models/Street");
const mongoose = require("mongoose");
const { response, json } = require("express");
const { create } = require("../models/Street");

//get all streets
const getAllStreets = async () => {
  try {
    const results = await Street.find({});
    return results;
  } catch (err) {
    console.error(err);
  }
};

//get single street
const getSingleStreet = async (streetName) => {
  try {
    const result = await Street.findOne({ name: streetName });
    console.log(`Retrieved street "${streetName}":`, result);
    return result;
  } catch (err) {
    console.error(err);
  }
};

//delete a street
const deleteStreet = async (streetName) => {
  try {
    const result = await Street.deleteOne({ name: streetName });
    console.log(`Deleted street "${streetName}":`, result);
    return result;
  } catch (err) {
    console.error(err);
  }
};

//update a street
const updateStreet = async (streetName, newStreet) => {
  try {
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
    console.log("streetNames", streetNames);
    const streets = await Street.find({
      name: { $regex: new RegExp(streetNames.join("|"), "i") },
    });
    const totalScore = streets.reduce((acc, street) => acc + street[field], 0);
    console.log(`Total score for ${field} in streets:`, totalScore);
    return totalScore;
  } catch (err) {
    console.Error(err);
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

module.exports = {
  getAllStreets,
  getSingleStreet,
  deleteStreet,
  updateStreet,
  createStreets,
  createStreet,
  getTotalScoreForStreets,
  removeDuplicates,
};
