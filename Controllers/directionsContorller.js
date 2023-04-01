const axios = require("axios");
require("dotenv").config();
const {
  getFieldScoreForStreets,
} = require("../Controllers/mongoStreetsController");

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
async function getStreetsInAlternative(index, origin, destination, preference,req,res) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const mode = "walking";
  const alternatives = true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let streetsPerAlternative = new Set();
    let arrPerAlt = [];
    ret.routes[index].legs.map((leg) => {
      leg.steps.map((step) => {
        const instruction = step.html_instructions;
        const regex = /<b>(.*?)<\/b>/g;
        const matches = instruction.match(regex);
        const arr = matches
          ? matches.map((match) => match.replace(/<\/?b>/g, ""))
          : [];
        arr.map((elem) => {
          if (elem.includes("St")) {
            const formattedName =
              elem.replace(/\s*\bSt\.?\s*$/i, "").trim() + " St";
            streetsPerAlternative.add(formattedName);
            arrPerAlt = Array.from(streetsPerAlternative);
          }
        });
      });
    });
    return arrPerAlt;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

async function getBestAlternative(routes, origin, destination, preference){
  let maxWeight = 0;
  let bestIndex = 0;
  for (let i = 0; i < routes.length; i++) {
    const streetsInAlternative = await getStreetsInAlternative(
      i,
      origin,
      destination,
      preference
    );
    const totalWeightInAlternative = await getTotalWeightInAlternative(
      streetsInAlternative,
      preference
    );
    if (totalWeightInAlternative > maxWeight) {
      maxWeight = totalWeightInAlternative;
      bestIndex = i;
    }
  }
  return bestIndex;
}

async function getTotalWeightInAlternative(streetsInAlternative, preference,req,res) {
  const totalWeightInAlternative = await getFieldScoreForStreets(
    streetsInAlternative,
    preference
  );
  return totalWeightInAlternative;
}

exports.getDirections = async (origin, destination, preference) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const mode = "walking";
  const alternatives = true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;

  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let routes = ret.routes;
    const bestAlternativeRouteIndex = await getBestAlternative(
      routes,
      origin,
      destination,
      preference
    );
    return ret.routes[bestAlternativeRouteIndex];
  } catch (error) {
    console.error(error);
  }
};

exports.getXYListinBestRoute = async (origin, destination, preference) => {
  try {
    let arr = []
    const response = await this.getDirections(origin, destination, preference);
    const data = response.legs[0];
    const steps = data.steps;
    const size = steps.length;
    
    arr.push({start_location: {x:data.start_location.lng, y:data.start_location.lat}});
    arr.push({end_location: {x:data.end_location.lng, y: data.end_location.lat}});
    
    for (let i = 0; i< size; i++){
      const index = i+1;
      const xStart = steps[i].start_location.lng;
      const yStart = steps[i].start_location.lat;
      const xEnd = steps[i].end_location.lng;
      const yEnd = steps[i].end_location.lat;
      arr.push({index: index, start:{x:xStart, y:yStart}, end:{x:xEnd,y:yEnd}});
    }
    return arr;
    
  } catch (error) {
    console.error(error);
  }
};

