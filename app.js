const app = require("./server");
const mongoose = require("mongoose");
const PORT = 8080;

app.listen(PORT, console.log(`port is running on port ${PORT}...`));

module.exports = app;

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
