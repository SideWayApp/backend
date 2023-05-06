const express = require("express");
const router = express.Router();
const scraperController = require("../Controllers/scraperController");

// http://localhost:8080/scrape/..
/**
 * @swagger
 * /scrape/streetWebsite:
 *   get:
 *     summary: Get a list of scraped streets.
 *     description: Returns an array of street names and corresponding data scraped from a website.
 *     responses:
 *       200:
 *         description: Successfully retrieved scraped streets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *     tags:
 *       - Scraper
 */
router.get("/streetWebsite", scraperController.getScarpedStreets);

/**
 * @swagger
 * /scrape/RISHON_streetsGIS:
 *   get:
 *     summary: Get a list of scraped streets.
 *     description: Returns an array of street names and corresponding data scraped from a website.
 *     responses:
 *       200:
 *         description: Successfully retrieved scraped streets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *     tags:
 *       - Scraper
 */
router.get("/RISHON_streetsGIS", scraperController.getStreetsFromRISHONGis);

router.get("/streetWebsite", scraperController.getScarpedStreets);
router.post("/TLV-StreetsGIS", scraperController.getStreetsFromTLVGis);
router.post("/formatAllMongoStreets", scraperController.formateAllMongoStreets);
router.post(
  "/removeDuplicateStreets",
  scraperController.removeDuplicateStreets
);

module.exports = router;
