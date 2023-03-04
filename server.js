const express = require('express');
const directionsRoute = require('./Routes/directionsRoutes ');
const app = express();
const PORT = 8080;
app.use('/api', directionsRoute);
app.listen(PORT,console.log(`port is running on port ${PORT}...`));
