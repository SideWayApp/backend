const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
exports.getDirections = async (req, res) => {

  const { origin, destination} = req.body;
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const mode= 'walking';
  const alternatives= true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let streets = new Set();
    ret.routes.map(route=>{
    route.legs.map(leg => {
        leg.steps.map(step=>{
            streets.add(step.html_instructions);
        })
      })
    });
    const streetsArray = Array.from(streets);
    const streetRegex = /<b>([^<]+)\b\s*St<\/b>/gi;

    const streetMatches = streetsArray.join(',').match(streetRegex);
    const streets1 = streetMatches.map(match => match.replace(/<\/?b>/g, ''));

    console.log(streets1);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};