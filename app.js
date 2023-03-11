const app = require("./server");
const PORT = process.env.PORT;

app.listen(PORT, console.log(`port is running on port ${PORT}...`));

module.exports = app;
