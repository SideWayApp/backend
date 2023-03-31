const express = require("express")
const mapItemsFromTLVApiController = require("../Controllers/mapItemsFromTLVApiController")

const router = express.Router()

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
 */ router.get(
	"/allCameras",
	mapItemsFromTLVApiController.getAllCamerasFromTLVApiAddToMongo
)
/**
 * @swagger
 * /mapitems/allDangerousConstrucions:
 *   get:
 *     summary: get all dangerous constructions from tlv api and add it to mongodb
 *     tags: [Dangerous Construcions Api]
 *     responses:
 *       200:
 *         description: Dangerous constructions added to mongodb
 *
 */
router.get(
	"/allDangerousConstrucions",
	mapItemsFromTLVApiController.getAllDangerousConstructionsFromTLVApiAddToMongo
)

module.exports = router
