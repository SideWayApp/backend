require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const directionsRoute = require("./Routes/directionsRoutes");
const scraperRoutes = require("./Routes/scraperRoutes");
const streetsRoutes = require("./Routes/streetsRoutes");
const mapItemsRoutes = require("./Routes/mapItemsRoutes");
const getAllCamerasFromTLVApiRoute = require("./Routes/mapItemsFromTLVApiRoutes");
const AuthenticationRoutes = require("./Routes/authenticationRoutes")
app.use(cors());
app.use(express.json());
app.use("/gis", getAllCamerasFromTLVApiRoute);
app.use("/directions", directionsRoute);
app.use("/scrape", scraperRoutes);
app.use("/api/streets", streetsRoutes);
app.use("/api/items", mapItemsRoutes);
app.use("/api/authentication",AuthenticationRoutes);

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
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          scheme: 'bearer',
          in: 'header',  
        },
      }
    },
    apis: ["./Routes/*.js"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}


function checkRender(req, res) {
  // Logic to check render
  // ...
  res.json({ message: "Render checked" });
}
app.get("/api/check-render", checkRender);

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
