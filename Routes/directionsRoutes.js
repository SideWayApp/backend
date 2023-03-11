const express = require('express');
const directionsController = require('../Controllers/directionsContorller');

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
*       properties:
*         origin:
*           type: string
*           description: The Origin Address 
*         destination:
*           type: string
*           description: The Destination Address
*       example:
*         origin: 'Hahelmonit 34, Rishon Le-Zion'
*         destination: 'Eli Visel 2, Rihson Le-Zion'
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
*         description: The Streets list
*/router.post('/directions', directionsController.getDirections);

module.exports = router;