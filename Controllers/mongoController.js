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

//create new street
const createStreet = async (req, res) => {
  const { id, name, city, clean, safe, scenery, accessible, total } = req.body;

  let emptyFields = [];

  //check for all fileds
  if (!id) {
    emptyFields.push("id");
  }
  if (!name) {
    emptyFields.push("name");
  }
  if (!city) {
    emptyFields.push("city");
  }
  if (!clean) {
    emptyFields.push("clean");
  }
  if (!safe) {
    emptyFields.push("safe");
  }
  if (!scenery) {
    emptyFields.push("scenery");
  }
  if (!accessible) {
    emptyFields.push("accessible");
  }
  if (!total) {
    emptyFields.push("total");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill all the fields", emptyFields });
  }

  //add doc to db
  try {
    const street = await Street.create({
      id,
      name,
      city,
      clean,
      safe,
      scenery,
      accessible,
      total,
    });
    res.status(200).json(street);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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

module.exports = {
  getAllStreets,
  getSingleStreet,
  createStreet,
  deleteStreet,
  updateStreet,
};
