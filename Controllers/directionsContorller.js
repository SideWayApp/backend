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
    let streetsArrayForDirection = [];
    ret.routes.map(route=>{
      let streetsPerAlternative = [];
      route.legs.map(leg => {
        leg.steps.map(step=>{
          const instruction = step.html_instructions;
          const regex = /<b>(.*?)<\/b>/g;
          const matches = instruction.match(regex);
          const arr = matches ? matches.map(match => match.replace(/<\/?b>/g, '')) : [];
          arr.map(elem => {
            if (elem.includes("St"))
              streetsPerAlternative.push(elem)
          });
        });
        streetsArrayForDirection.push(streetsPerAlternative);   
      });
    });
    // console.log(streetsArrayForDirection)
    res.send(streetsArrayForDirection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};