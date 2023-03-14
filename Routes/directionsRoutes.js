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
 * /api/directions:
 *   post:
 *     summary: get all streets in alternatives
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
 */ router.post("/directions", directionsController.getDirections);

module.exports = router;
