const express = require("express")
const directionsController = require("../Controllers/directionsContorller")

const router = express()

// /**
// * @swagger
// * tags:
// *  name: Open the Api
// */

/**
 * @swagger
 * components:
 *   schemas:
 *     Directions:
 *       type: object
 *       required:
 *         - origin
 *         - destination
 *         - preference
 *       properties:
 *         origin:
 *           type: string
 *           description: The Origin Address
 *         destination:
 *           type: string
 *           description: The Destination Address
 *         preference:
 *           type: string
 *           description: The preference
 *       example:
 *         origin: 'Louis Marshall 41, Tel Aviv'
 *         destination: 'Ahi Dakar 1, Tel Aviv'
 *         preference: 'clean'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: string
 *           description: The latitude's coords
 *         longitude:
 *           type: string
 *           description: The longitude's coords
 *       example:
 *         latitude: '32.05169730746334'
 *         longitude: '34.76187512527052'
 */



/**
 * @swagger
 * /directions/bestAlternative:
 *   post:
 *     summary: get best alternative's full route
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Directions'
 *     responses:
 *       200:
 *         description: The Best Route
 */
router.post("/bestAlternative", async (req, res) => {
  const data = await directionsController.getDirections(req.body.origin, req.body.destination, req.body.preference);
  res.send(data);
});

/**
 * @swagger
 * /directions/getXYListinBestRoute:
 *   post:
 *     summary: get best alternative's x,y of each step
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Directions'
 *     responses:
 *       200:
 *         description: The x,y of the best route's steps
 */
router.post("/getXYListinBestRoute", async (req, res) => {
  const data = await directionsController.getXYListinBestRoute(req.body.origin, req.body.destination, req.body.preference);
  res.send(data);
});

/**
 * @swagger
 * /directions/getWayPoints:
 *   post:
 *     summary: get latitude and longitude for waypoints in direction
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Directions'
 *     responses:
 *       200:
 *         description: An array of latitudes and longitudes
 */
router.post("/getWayPoints", async (req, res) => {
  const data = await directionsController.getWayPoints(req.body.origin, req.body.destination, req.body.preference);
  res.send(data);
});


/**
 * @swagger
 * /directions/getInstructions:
 *   post:
 *     summary: get instructions arr in direction
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Directions'
 *     responses:
 *       200:
 *         description: An array of latitudes and longitudes
 */
router.post("/getInstructions", async (req, res) => {
  const data = await directionsController.getInstructions(req.body.origin, req.body.destination, req.body.preference);
  res.send(data);
});


/**
 * @swagger
 * /directions/getAddressFromLatLng:
 *   post:
 *     summary: get address from latitude and longitude coordinates
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: An address from longitude and latitude
 */
router.post("/getAddressFromLatLng", async (req, res) => {
  const data = await directionsController.getAddressFromLatLng(req.body.latitude, req.body.longitude);
  res.send(data);
});


module.exports = router
