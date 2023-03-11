require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const directionsRoute = require("./Routes/directionsRoutes");
const scraperRoutes = require("./Routes/scraperRoutes");
app.use(cors());
app.use(express.json());
app.use("/api", directionsRoute);
app.use("/scrape", scraperRoutes);

//connect to db
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("connected"))
  .catch((err) => console.log(err));

module.exports = app;
