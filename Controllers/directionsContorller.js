const axios = require('axios');

exports.getDirections = async (req, res) => {
  const { origin, destination, mode, alternatives } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = 'https://maps.googleapis.com/maps/api/directions/json';
  const params = {
    origin: origin,
    destination: destination,
    mode: mode || 'walking',
    alternatives: alternatives || true,
    key: apiKey
  };

  try {
    const response = await axios.post(url, params);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};