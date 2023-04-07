const express = require("express");
const router = express.Router();
const {
  addMapItem,
  getAllMapItemsByCity,
  getMapItemsByType,
  updateMapItem,
  deleteMapItem,
  getMapItemsByRegion,
} = require("../Controllers/mongoMapItemsController");

/**
 * @swagger
 * tags:
 *   name: Map Items API
 *   description: API for managing map items
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
 *         x:
 *           type: number
 *           description: The x coordinate of the map item
 *           example: 0
 *         y:
 *           type: number
 *           description: The y coordinate of the map item
 *           example: 0
 *
 */

/**
 * @swagger
 * /api/items/add:
 *   post:
 *     summary: Create a new map item
 *     tags: [Map Items API]
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
router.post("/add", async (req, res) => {
  const item = await addMapItem(
    req.body.type,
    req.body.streetName,
    req.body.city,
    req.body.x,
    req.body.y
  );
  res.send(item);
});

/**
 * @swagger
 * /api/items/city/{city}:
 *   post:
 *     summary: Get all map items by city
 *     tags: [Map Items API]
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: The city to filter the map items by.
 *         example: Tel-Aviv
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

router.post("/city/:city", async (req, res) => {
  const items = await getAllMapItemsByCity(req.params.city);
  res.send(items);
});

/**
 * @swagger
 * /api/items/update/{itemId}:
 *   put:
 *     summary: Update a map item by ID
 *     tags: [Map Items API]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the map item to update.
 *         example: 6125a5a9c8786e001b2da0a1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MapItemUpdates'
 *     responses:
 *       '200':
 *         description: The updated map item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MapItem'
 *       '400':
 *         description: Bad request. Updates parameter is missing or invalid.
 *       '404':
 *         description: Map item not found.
 *       '500':
 *         description: Internal server error.
 */

router.put("/update/:itemId", async (req, res) => {
  const item = await updateMapItem(req.params.itemId, req.body);
  res.send(item);
});

/**
 * @swagger
 * /api/items/delete/{itemId}:
 *   delete:
 *     summary: Delete a map item by ID
 *     tags: [Map Items API]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the map item to delete.
 *         example: 6125a5a9c8786e001b2da0a1
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

router.delete("/delete/:itemId", async (req, res) => {
  const item = await deleteMapItem(req.params.itemId);
  res.send(item);
});

/**
 * @swagger
 * /api/items/region:
 *   post:
 *     summary: Get map items by region
 *     tags: [Map Items API]
 *     requestBody:
 *       description: Region object containing the current map region
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              latitude:
 *               type: number
 *              longitude:
 *                type: number
 *              latitudeDelta:
 *                type: number
 *              longitudeDelta:
 *                type: number
 *           example: {"latitude": 32.05055472703401, "latitudeDelta": 0.018986824223155452, "longitude": 34.757151060159345, "longitudeDelta": 0.015121697826685931}
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/MapItem'
 */

router.post("/region", async (req, res) => {
  console.log("region", req.body);
  const items = await getMapItemsByRegion(req.body);
  res.send(items);
});

module.exports = router;
