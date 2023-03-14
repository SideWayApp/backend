const express = require("express");
const {
  getAllStreets,
  getSingleStreet,
  createStreet,
  deleteStreet,
  updateStreet,
  removeDuplicates,
} = require("../Controllers/mongoStreetsController");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: MongoDB Streets
 *   description: Endpoints for MongoDB Streets operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Street:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the street.
 *           example: 6125a5a9c8786e001b2da0a1
 *         name:
 *           type: string
 *           description: The name of the street.
 *           example: Main Street
 *         city:
 *           type: string
 *           description: The city in which the street is located.
 *           example: Los Angeles
 *         clean:
 *           type: number
 *           description: The cleanliness score of the street.
 *           example: 4.5
 *         safe:
 *           type: number
 *           description: The safety score of the street.
 *           example: 3.8
 *         scenery:
 *           type: number
 *           description: The scenery score of the street.
 *           example: 4.2
 *         accessible:
 *           type: number
 *           description: The accessibility score of the street.
 *           example: 2.5
 *         total:
 *           type: number
 *           description: The total score of the street.
 *           example: 3.8
 */

/**
 * @swagger
 * /mongo/getAllStreets:
 *   post:
 *     summary: Get all streets from the MongoDB database
 *     tags: [MongoDB Streets]
 *     responses:
 *       200:
 *         description: A list of all streets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Street'
 */

router.post("/getAllStreets", async (req, res) => {
  console.log("get all streets");
  const allStreets = await getAllStreets();
  res.send(allStreets);
});

/**
 * @swagger
 * /mongo/getStreetByName:
 *   post:
 *     summary: Get a single street by name from the MongoDB database
 *     tags: [MongoDB Streets]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the street to retrieve
 *     responses:
 *       200:
 *         description: The street with the specified name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Street'
 */
router.post("/getStreetByName", async (req, res) => {
  console.log(req.query.name);
  const street = await getSingleStreet(req.query.name);
  if (street) {
    res.send(street);
  } else {
    res.status(404).json({ message: "Street not found" });
  }
});

/**
 * @swagger
 * /mongo/updateStreetByName:
 *   put:
 *     summary: Update a street by name
 *     tags: [MongoDB Streets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Street'
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Name of the street to update
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Street updated successfully
 *       '400':
 *         description: Invalid input parameters
 *       '404':
 *         description: Street not found
 *       '500':
 *         description: Internal server error
 */
router.put("/updateStreetByName", async (req, res) => {
  const updated = await updateStreet(req.query.name, req.body);
  res.send(updated);
});

/**
 * @swagger
 * /mongo/createStreet:
 *   post:
 *     summary: Create a new street
 *     tags: [MongoDB Streets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Street'
 *     responses:
 *       '201':
 *         description: Street created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Street'
 *       '400':
 *         description: Invalid input parameters
 *       '500':
 *         description: Internal server error
 */
router.post("/createStreet", async (req, res) => {
  const newStreet = await createStreet(req.body);
  res.send(newStreet);
});

/**
 * @swagger
 * /mongo/deleteStreetByName:
 *   delete:
 *     summary: Delete a street by name
 *     tags: [MongoDB Streets]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: Name of the street to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Street deleted successfully
 *       '400':
 *         description: Invalid input parameters
 *       '404':
 *         description: Street not found
 *       '500':
 *         description: Internal server error
 */
router.delete("/deleteStreetByName", async (req, res) => {
  const deleted = await deleteStreet(req.query.name);
  res.send(deleted);
});

/**
 * @swagger
 * /mongo/removeDuplicates:
 *   get:
 *     summary: Remove duplicate streets
 *     tags: [MongoDB Streets]
 *     responses:
 *       '200':
 *         description: Duplicates removed successfully
 *       '500':
 *         description: Internal server error
 */
router.get("/removeDuplicates", async (req, res) => {
  const dup = await removeDuplicates();
  res.send(dup);
});

module.exports = router;
