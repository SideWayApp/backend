const express = require("express");
const directionsController = require("../Controllers/directionsContorller");

const router = express();

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
 *         - preferences
 *       properties:
 *         origin:
 *           type: string
 *           description: The Origin Address
 *         destination:
 *           type: string
 *           description: The Destination Address
 *         preferences:
 *           type: object
 *           properties:
 *             accessibility:
 *               type: boolean
 *               description: The accessibility preference
 *             clean:
 *               type: boolean
 *               description: The cleanliness preference
 *             scenery:
 *               type: boolean
 *               description: The scenery preference
 *             security:
 *               type: boolean
 *               description: The security preference
 *             speed:
 *               type: boolean
 *               description: The speed preference
 *       example:
 *         origin: 'Louis Marshall 41, Tel Aviv'
 *         destination: 'Ahi Dakar 1, Tel Aviv'
 *         preferences:
 *           accessibility: true
 *           clean: false
 *           scenery: false
 *           security: true
 *           speed: false
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordinates:
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
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - address
 *       properties:
 *         address:
 *           type: string
 *           description: The Address
 *       example:
 *         address: 'Ha-Khelmonit 34, Rishon Le-Zion'
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
  const data = await directionsController.getDirections(
    req.body.origin,
    req.body.destination,
    req.body.preferences
  );
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
  const data = await directionsController.getXYListinBestRoute(
    req.body.origin,
    req.body.destination,
    req.body.preference
  );
  res.send(data);
});


/**
 * @swagger
 * /directions/getDurationAndDistance:
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
router.post("/getDurationAndDistance",async (req,res)=>{
  const data = await directionsController.getDurationAndDistance(
    req.body.origin,
    req.body.destination,
    req.body.preference
  );
  res.send(data);
});



/**
 * @swagger
 * /directions/getWayPointsAndInstructions:
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
router.post("/getWayPointsAndInstructions", async (req, res) => {
  const data = await directionsController.getWayPointsAndInstructions(
    req.body.origin,
    req.body.destination,
    req.body.preference
  );
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
  const data = await directionsController.getInstructions(
    req.body.origin,
    req.body.destination,
    req.body.preference
  );
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
 *             $ref: '#/components/schemas/Coordinates'
 *     responses:
 *       200:
 *         description: An address from longitude and latitude
 */
router.post("/getAddressFromLatLng", async (req, res) => {
  const data = await directionsController.getAddressFromLatLng(
    req.body.latitude,
    req.body.longitude
  );
  res.send(data);
});


/**
 * @swagger
 * /directions/getCoordsOfAddress:
 *   post:
 *     summary: get coordinates from address using geocoding
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
router.post("/getCoordsOfAddress", async (req, res) => {
  const data = await directionsController.getCoordsOfAddress(
    req.body.address,
  );
  res.send(data);
});



/**
 * @swagger
 * /directions/getAddressFromCoordinates:
 *   post:
 *     summary: get address from latitude and longitude coordinates
 *     tags: [Directions Api]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coordinates'
 *     responses:
 *       200:
 *         description: An address from longitude and latitude
 */
router.post("/getAddressFromCoordinates", async (req, res) => {
  const data = await directionsController.getAddressFromCoordinates(
    req.body.latitude,
    req.body.longitude
  );
  res.send(data);
});

/**
 * @swagger
 * /directions/getAddressCoordinates:
 *   post:
 *     summary: get coordinates from address using geocoding
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
router.post("/getAddressCoordinates", async (req, res) => {
  const data = await directionsController.getAddressCoordinates(
    req.body.address,
  );
  res.send(data);
});




module.exports = router;
