const express = require("express");
const router = express();

const scraperController = require("../Controllers/scraperController");

router.get("/streets", scraperController.getScarpedStreets);
router.post("/fromGIS", scraperController.getStreetsFromGis);

module.exports = router;
