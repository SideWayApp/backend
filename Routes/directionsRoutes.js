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


module.exports = router
