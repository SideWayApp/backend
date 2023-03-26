const express = require("express");
const mapItemsFromTLVApiController = require('../Controllers/mapItemsFromTLVApiController')

const router = express.Router();

// /**
// * @swagger
// * tags:
// *  name: Cameras Api
// *  description: Cameras from Tel-Aviv Api
// */

/**
 * @swagger
 * /mapitems/allCameras:
 *   get:
 *     summary: get all cameras from tlv api and add it to mongodb
 *     tags: [Cameras Api]
 *     responses:
 *       200:
 *         description: Cameras added to mongodb 
 */router.get("/allCameras",mapItemsFromTLVApiController.getAllCamerasFromTLVApiAddToMongo);

module.exports = router;