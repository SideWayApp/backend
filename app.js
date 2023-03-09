const app = require("./server");
const mongoose = require("mongoose");
const PORT = 8080;

const directionsRoutes = require("./routes/directionsRoutes.js");
const mongoRoutes = require("./routes/mongoRoutes.js");
const scraperRoutes = require("./routes/scraperRoutes.js");

app.listen(PORT, console.log(`port is running on port ${PORT}...`));

module.exports = app;

app.use("/api/directions", directionsRoutes);
app.use("/api/mongo", mongoRoutes);
app.use("/api/scraper", scraperRoutes);

//connect to db
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    //listen for requests
    app.listen(process.env.PORT, () => {
      console.log(
        "connected to db & listening on port",
        process.env.PORT,
        "!!"
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
