const express = require("express");
const router = express.Router();
const scraperController = require("../Controllers/scraperController");

// http://localhost:8080/scrape/..
router.get("/TLV-streetWebsite", scraperController.getScarpedStreets);
router.post("/TLV-StreetsGIS", scraperController.getStreetsFromTLVGis);
router.post("/formatAllMongoStreets", scraperController.formateAllMongoStreets);
router.post(
  "/removeDuplicateStreets",
  scraperController.removeDuplicateStreets
);

module.exports = router;
