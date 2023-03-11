const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
async function getStreetsInAlternative(index,origin,destination){
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const mode= 'walking';
  const alternatives= true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let streetsPerAlternative = new Set();
    let arrPerAlt = [];
    ret.routes[index].legs.map(leg => {
        leg.steps.map(step=>{
          const instruction = step.html_instructions;
          const regex = /<b>(.*?)<\/b>/g;
          const matches = instruction.match(regex);
          const arr = matches ? matches.map(match => match.replace(/<\/?b>/g, '')) : [];
          arr.map(elem => {
            if (elem.includes("St"))
              streetsPerAlternative.add(elem)
              arrPerAlt = Array.from(streetsPerAlternative);
          });
        });
      });
    //console.log(streetsPerAlternative)
    return streetsPerAlternative;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};

async function getBestAlternative(routes,origin,destination){
  for (let i =0; i< routes.length; i++){
    console.log(i);
    const streets = await getStreetsInAlternative(i,origin,destination);
    console.log(streets);
  }
} 

exports.getDirections = async (req, res) => {

  const { origin, destination} = req.body;
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const mode= 'walking';
  const alternatives= true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let routes = ret.routes;
    const bestAlternativeRoute = getBestAlternative(routes,origin,destination); 
    res.send(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};

