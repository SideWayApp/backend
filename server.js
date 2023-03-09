require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const directionsRoute = require("./Routes/directionsRoutes");
const scraperRoutes = require("./Routes/scraperRoutes");
app.use(cors());
app.use(express.json());
app.use("/api", directionsRoute);
app.use("/scrape", scraperRoutes);

module.exports = app;
