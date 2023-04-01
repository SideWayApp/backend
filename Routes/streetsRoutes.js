const express = require("express");
const {
  getAllStreets,
  getSingleStreet,
  createStreet,
  deleteStreet,
  updateStreet,
  removeDuplicates,
  removeTotalScoreForStreets,
  updateVirtualScore,
} = require("../Controllers/mongoStreetsController");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Streets API
 *   description: Endpoints for Streets operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Score:
 *       type: object
 *       properties:
 *         score:
 *           type: number
 *           description: The score value.
 *           example: 4.5
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the score was added.
 *           example: '2022-03-15T10:30:00Z'
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
 *           type: array
 *           description: The cleanliness scores of the street.
 *           items:
 *             $ref: '#/components/schemas/Score'
 *         safe:
 *           type: array
 *           description: The safety scores of the street.
 *           items:
 *             $ref: '#/components/schemas/Score'
 *         scenery:
 *           type: array
 *           description: The scenery scores of the street.
 *           items:
 *             $ref: '#/components/schemas/Score'
 *         accessible:
 *           type: array
 *           description: The accessibility scores of the street.
 *           items:
 *             $ref: '#/components/schemas/Score'
 *         total:
 *           type: number
 *           description: The average of all scores.
 *           example: 3.9
 *     UpdateValues:
 *       type: object
 *       properties:
 *         clean:
 *           type: number
 *           description: The cleanliness score to update.
 *           example: 4.5
 *         safe:
 *           type: number
 *           description: The safety score to update.
 *           example: 3.8
 *         scenery:
 *           type: number
 *           description: The scenery score to update.
 *           example: 4.2
 *         accessible:
 *           type: number
 *           description: The accessibility score to update.
 *           example: 2.5
 */

/**
 * @swagger
 * /api/streets/all-streets/{city}:
 *   post:
 *     summary: Get all streets from the MongoDB database for a given city
 *     tags: [Streets API]
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: The city for which to retrieve all streets.
 *         example: Tel-Aviv
 *     responses:
 *       200:
 *         description: A list of all streets for the given city.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Street'
 */

router.post("/all-streets/:city", async (req, res) => {
  const allStreets = await getAllStreets(req.params.city);
  res.send(allStreets);
});

/**
 * @swagger
 * /api/streets/{city}/{streetName}:
 *   post:
 *     summary: Get a single street by name from the MongoDB database
 *     tags: [Streets API]
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the city to search for the street in.
 *         example: Tel-Aviv
 *       - in: path
 *         name: streetName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the street to retrieve.
 *         example: Main Street
 *     responses:
 *       200:
 *         description: The street with the specified name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Street'
 *       404:
 *         description: Street not found.
 */

router.post("/:city/:streetName", async (req, res) => {
  const street = await getSingleStreet(req.params.city, req.params.streetName);
  if (street) {
    res.send(street);
  } else {
    res.status(404).json({ message: "Street not found" });
  }
});

/**
 * @swagger
 * /api/streets/update/{city}/{streetName}:
 *   put:
 *     summary: Update a street by name
 *     tags: [Streets API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateValues'
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the city to search for the street in.
 *         example: Tel-Aviv
 *       - in: path
 *         name: streetName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the street to retrieve.
 *         example: Main Street
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
router.put("/update/:city/:streetName", async (req, res) => {
  console.log(req.params);
  const updated = await updateStreet(
    req.params.city,
    req.params.streetName,
    req.body
  );
  res.send(updated);
});

/**
 * @swagger
 * /api/streets/create:
 *   post:
 *     summary: Create a new street
 *     tags: [Streets API]
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
router.post("/create", async (req, res) => {
  console.log("create", req.body);
  const newStreet = await createStreet(req.body);
  res.send(newStreet);
});

/**
 * @swagger
 * /api/streets/delete/{city}/{streetName}:
 *   delete:
 *     summary: Delete a street by name
 *     tags: [Streets API]
 *     parameters:
 *       - name: city
 *         in: query
 *         required: true
 *         description: City of the street to delete
 *         schema:
 *           type: string
 *       - name: streetName
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
router.delete("/delete/:city/:streetName", async (req, res) => {
  const deleted = await deleteStreet(req.params.city, req.params.streetName);
  res.send(deleted);
});

/**
 * @swagger
 * /api/steets/remove-duplicates:
 *   post:
 *     summary: Remove duplicate streets
 *     tags: [Streets API]
 *     responses:
 *       '200':
 *         description: Duplicates removed successfully
 *       '500':
 *         description: Internal server error
 */
router.post("/remove-duplicates", async (req, res) => {
  const dup = await removeDuplicates();
  res.send(dup);
});

router.get("/removeTotal", async (req, res) => {
  console.log("remove total");
  await removeTotalScoreForStreets();
  res.send("done");
});

router.get("/updateStreets", async (req, res) => {
  console.log("update total");
  await updateVirtualScore();
  res.send("done");
});
module.exports = router;
