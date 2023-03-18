const express = require("express");
const router = express.Router();
const {
  addMapItem,
  getAllMapItemsByCity,
  getMapItemsByType,
  updateMapItem,
  deleteMapItem,
} = require("../Controllers/mongoMapItemsController");

/**
 * @swagger
 * tags:
 *   name: MongoDB Map Items
 *   description: API for managing map items in MongoDB
 */

/**
 * @swagger
 * components:
 *  schemas:
 *     MapItemUpdates:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: The updated type of the map item.
 *           example: Tree
 *         streetName:
 *           type: string
 *           description: The updated name of the street where the map item is located.
 *           example: Main Street
 *         city:
 *           type: string
 *           description: The updated city in which the map item is located.
 *           example: Los Angeles
 *     MapItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: The type of the map item.
 *           example: Camera
 *         streetName:
 *           type: string
 *           description: The name of the street where the map item is located.
 *           example: Main Street
 *         city:
 *           type: string
 *           description: The city in which the map item is located.
 *           example: Los Angeles
 *
 */

/**
 * @swagger
 * /mongo/addMapItem:
 *   post:
 *     summary: Create a new street
 *     tags: [MongoDB Map Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MapItem'
 *     responses:
 *       '201':
 *         description: MapItem created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Invalid input parameters
 *       '500':
 *         description: Internal server error
 */
router.post("/addMapItem", async (req, res) => {
  const item = await addMapItem(
    req.body.type,
    req.body.streetName,
    req.body.city
  );
  res.send(item);
});

/**
 * @swagger
 * /mongo/getAllItemsByCity:
 *   post:
 *     summary: Get all map items by city
 *     tags: [MongoDB Map Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 description: The city to filter the map items by.
 *                 example: Los Angeles
 *             required:
 *               - city
 *     responses:
 *       '200':
 *         description: A list of map items filtered by city.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Bad request. City parameter is missing or invalid.
 *       '500':
 *         description: Internal server error.
 */

router.post("/getAllItemsByCity", async (req, res) => {
  const items = await getAllMapItemsByCity(req.body.city);
  res.send(items);
});

/**
 * @swagger
 * /mongo/getMapItemsByType:
 *   post:
 *     summary: Get map items by type and city
 *     tags: [MongoDB Map Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the map item.
 *                 example: Camera
 *               city:
 *                 type: string
 *                 description: The city to filter the map items by.
 *                 example: Los Angeles
 *             required:
 *               - type
 *               - city
 *     responses:
 *       '200':
 *         description: A list of map items filtered by type and city.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Bad request. Type or city parameter is missing or invalid.
 *       '500':
 *         description: Internal server error.
 */
router.post("/getMapItemsByType", async (req, res) => {
  const item = await getMapItemsByType(req.body.type, req.body.city);
  res.send(item);
});

/**
 * @swagger
 * /mongo/updateMapItem:
 *   put:
 *     summary: Update a map item by ID
 *     tags: [MongoDB Map Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the map item to update.
 *                 example: 6125a5a9c8786e001b2da0a1
 *               updates:
 *                 $ref: '#/components/schemas/MapItemUpdates'
 *             required:
 *               - id
 *               - updates
 *     responses:
 *       '200':
 *         description: The updated map item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Bad request. ID or updates parameter is missing or invalid.
 *       '404':
 *         description: Map item not found.
 *       '500':
 *         description: Internal server error.
 */

router.put("/updateMapItem", async (req, res) => {
  const item = await updateMapItem(req.body.id, req.body.updates);
  res.send(item);
});

/**
 * @swagger
 * /mongo/deleteMapItem:
 *   delete:
 *     summary: Delete a map item by ID
 *     tags: [MongoDB Map Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the map item to delete.
 *                 example: 6125a5a9c8786e001b2da0a1
 *             required:
 *               - id
 *     responses:
 *       '200':
 *         description: The deleted map item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Bad request. ID parameter is missing or invalid.
 *       '404':
 *         description: Map item not found.
 *       '500':
 *         description: Internal server error.
 */

router.delete("/deleteMapItem", async (req, res) => {
  const item = await deleteMapItem(req.body.id);
  res.send(item);
});
module.exports = router;
