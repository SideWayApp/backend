const express = require("express");
const router = express();

const scraperController = require("../Controllers/scraperController");

router.get("/streets", scraperController.getScarpedStreets);

module.exports = router;
