const express = require("express");
const {
  getAllStreets,
  getSingleStreet,
  createStreet,
  deleteStreet,
  updateStreet,
} = require("../controllers/mongoController");

const router = express.Router();

//GET all streets
router.get("/", getAllStreets);

//GET a single street by Id
router.get("/:id", getSingleStreet);

//POST a new street
router.post("/", createStreet);

//DELETE a street
router.delete("/:id", deleteStreet);

//UPDATE a street
router.patch("/:id", updateStreet);

module.exports = router;
