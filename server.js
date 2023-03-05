const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 8080;
const directionsController = require('./Controllers/directionsContorller');

app.use(cors());
app.use(express.json())
// app.use('/api', directionsRoute);
// app.post('/api/directions', async (req, res) => {
//     directionsContorller.getDirections();
// });
app.post('/api/directions',directionsController.getDirections);


app.listen(PORT,console.log(`port is running on port ${PORT}...`));
