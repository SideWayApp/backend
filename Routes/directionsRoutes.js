const express = require('express');
const directionsController = require('../Controllers/directionsContorller');

const router = express();

router.post('/directions', directionsController.getDirections);

module.exports = router;