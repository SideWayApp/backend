const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
exports.getDirections = async (req, res) => {
 // const { origin, destination, mode, alternatives } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    const origin= "Ha-Helmonit 34,Rishon Le-Zion";
    const destination= "Eli Vizel 2, Rishon Le-Zion";
    const mode= 'walking';
    const alternatives= true;
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};