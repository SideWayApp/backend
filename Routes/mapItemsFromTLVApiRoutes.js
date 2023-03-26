const express = require("express");
const mapItemsFromTLVApiController = require('../Controllers/mapItemsFromTLVApiController')

const router = express.Router();

router.get("/allCameras",mapItemsFromTLVApiController.getAllCamerasFromTLVApi);

module.exports = router;