const express = require("express")
const mapItemsFromTLVApiController = require("../Controllers/mapItemsFromTLVApiController")

const router = express.Router()

// /**
// * @swagger
// * tags:
// *  name: GIS Api
// *  description: Data from GIS in Tel-Aviv
// */

/**
 * @swagger
 * /gis/tlv/allLayerCodes:
 *   get:
 *     summary: get all layer codes from tlv api
 *     tags: [GIS Api]
 *     responses:
 *       200:
 *         description: All layer codes
 */ router.get("/tlv/allLayerCodes",async(req,res)=>{
	const data = await mapItemsFromTLVApiController.getAllLayersCodes();
	res.send(data);
 })

/**
 * @swagger
 * /gis/tlv/getDataFromLayer/{code}:
 *   post:
 *     summary: get data from specific layer by code
 *     tags: [GIS Api]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The layer code of the layer to get the data
 *         example: 506
 *     responses:
 *       200:
 *         description: Data of layer by layer code
 *       500:
 *         description: Internal server error.
 */ router.post("/tlv/getDataFromLayer/:code",async(req,res)=>{
	const data = await mapItemsFromTLVApiController.getDataFromLayer(req.params.code);
	res.send(data);
 })


 /**
 * @swagger
 * /gis/tlv/hebrewAddressToEnglish/{hebrewAddress}:
 *   post:
 *     summary: Translate a Hebrew address to English
 *     tags: [GIS Api]
*     parameters:
 *       - in: path
 *         name: hebrewAddress
 *         schema:
 *           type: string
 *         required: true
 *         description: Address in Hebrew to format in English
 *         example: החלמונית 34
 *     responses:
 *       200:
 *         description: The English translation of the Hebrew address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 englishAddress:
 *                   type: string
 *                   description: The English translation of the Hebrew address
 *       400:
 *         description: Bad request, missing or invalid parameter
 *       500:
 *         description: Internal server error
 */ 
 router.post("/tlv/hebrewAddressToEnglish/:hebrewAddress", async(req, res) => {
  const data = await mapItemsFromTLVApiController.hebrewAddressToEnglish(req.params.hebrewAddress);
  res.send(data);
});




/**
 * @swagger
 * /gis/tlv/getAllItemsByTypeAndCode/{code}/{type}:
 *   post:
 *     summary: Get items from a specific layer by code
 *     tags: [GIS Api]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: "The layer code of the layer to get the data. Example: 506"
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: "The type of the layer. Example: camera"
 *     responses:
 *       200:
 *         description: Data of layer by layer code
 *       500:
 *         description: Internal server error.
 */ 
router.post("/tlv/getAllItemsByTypeAndCode/:code/:type", async(req, res) => {
  const data = await mapItemsFromTLVApiController.getAllItemsByTypeAndCode(req.params.code, req.params.type);
  res.send(data);
});

/**
 * @swagger
 * /gis/tlv/addItemsToMongoPerTypeAndCode/{code}/{type}:
 *   post:
 *     summary: add items to mongo per type and code
 *     tags: [GIS Api]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: "The layer code of the layer to get the data. Example: 506"
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: "The type of the layer. Example: camera"
 *     responses:
 *       200:
 *         description: the items added to mongodb
 *       500:
 *         description: Internal server error.
 */ 
router.post("/tlv/addItemsToMongoPerTypeAndCode/:code/:type", async(req, res) => {
  const data = await mapItemsFromTLVApiController.addItemsToMongoPerTypeAndCode(req.params.code, req.params.type);
  res.send(data);
});



module.exports = router
