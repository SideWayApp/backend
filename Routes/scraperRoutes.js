const express = require("express");
const router = express();

const scraperController = require("../Controllers/scraperController");

router.get("/TLV-streetWebsite", scraperController.getScarpedStreets);
router.post("/TLV-StreetsGIS", scraperController.getStreetsFromTLVGis);

module.exports = router;
