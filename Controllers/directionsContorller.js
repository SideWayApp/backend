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
            if (elem.includes("St")){
              const formattedName = elem.replace(/\s*\bSt\b\.?$/, '');
              streetsPerAlternative.add(formattedName)
              arrPerAlt = Array.from(streetsPerAlternative);
            }
          });
        });
      });
    //console.log(streetsPerAlternative)
    return arrPerAlt;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};

async function getBestAlternative(routes,origin,destination){
  let maxWeight = 0;
  let bestIndex = 0;
  for (let i =0; i< routes.length; i++){
    const streetsInAlternative = await getStreetsInAlternative(i,origin,destination);
    const totalWeightInAlternative = await getTotalWeightInAlternative(streetsInAlternative);
    if (totalWeightInAlternative > maxWeight){
      maxWeight = total;
      bestIndex = index;
    }
  }
  return index;
} 
async function getTotalWeightInAlternative(streetsInAlternative){
  return 0;
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
    const bestAlternativeRouteIndex = await getBestAlternative(routes,origin,destination); 
    res.send(ret.routes[bestAlternativeRouteIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }  
};

