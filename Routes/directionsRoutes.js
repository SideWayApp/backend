const express = require('express');
const directionsController = require('../Controllers/directionsContorller');

const router = express.Router();

router.get('/directions', directionsController.getDirections);

module.exports = router;