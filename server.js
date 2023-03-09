const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 8080;
const directionsRoute = require("./Routes/directionsRoutes");
const scraperRoutes = require("./Routes/scraperRoutes");
app.use(cors());
app.use(express.json());
app.use("/api", directionsRoute);
app.use("/scrape", scraperRoutes);

app.listen(PORT, console.log(`port is running on port ${PORT}...`));
