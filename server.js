require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const directionsRoute = require("./Routes/directionsRoutes");
const scraperRoutes = require("./Routes/scraperRoutes");
const mongoStreetsRoutes = require("./Routes/mongoStreetsRoutes");
const mongoMapItemsRoutes = require("./Routes/mongoMapItemsRoutes");
app.use(cors());
app.use(express.json());
app.use("/api", directionsRoute);
app.use("/scrape", scraperRoutes);
app.use("/mongo", mongoStreetsRoutes);
app.use("/mongo", mongoMapItemsRoutes);

if (process.env.NODE_ENV === "development") {
  const swaggerUI = require("swagger-ui-express");
  const swaggerJsDoc = require("swagger-jsdoc");
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "SideWays API",
        version: "1.0.0",
        description: "SideWays Library API",
      },
      servers: [{ url: "http://localhost:" + process.env.PORT }],
    },
    apis: ["./Routes/*.js"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}

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
