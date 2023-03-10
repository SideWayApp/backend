const Street = require("../models/Street");
const mongoose = require("mongoose");
const { response, json } = require("express");

//get all streets
const getAllStreets = async (req, res) => {
  const streets = await Street.find({}).sort({ createdAt: -1 });

  res.status(200).json(streets);
};

//get single street
const getSingleStreet = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ err: "No such item" });
  }

  const street = await Street.findById(id);

  if (!street) {
    return res.status(404).json({ err: "No such item" });
  }

  res.status(200).json(street);
};

//delete a street
const deleteStreet = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ err: "No such item" });
  }

  const street = await Street.findOneAndDelete({ _id: id });

  if (!street) {
    res.status(404).json({ err: "No such item" });
  }

  res.status(200).json(street);
};

//update a street
const updateStreet = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ err: "No such item" });
  }

  const street = await Street.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!item) {
    res.status(404).json({ err: "No such item" });
  }

  res.status(200).json(street);
};

const createStreets = async (streets) => {
  const arr = [];
  streets.forEach(async (element) => {
    if (element.name != null && element.name != "") {
      const street = await new Street(element).save();
      arr.push(street);
    }
  });

  return arr;
};

module.exports = {
  getAllStreets,
  getSingleStreet,
  deleteStreet,
  updateStreet,
  createStreets,
};
