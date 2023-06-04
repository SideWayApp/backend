require("dotenv").config();
const axios = require("axios");
const {
  getFieldScoreForStreets,
} = require("../Controllers/mongoStreetsController");

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

exports.getAddressFromLatLng = async (lat, lng) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  try {
    const response = await axios.get(apiUrl);
    const address = response.data.results[0].formatted_address;
    return address;
  } catch (error) {
    console.error(error);
    return null;
  }
};



exports.getAddressFromCoordinates = async (latitude, longitude)=>{
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'accept-language': 'en' // Replace 'en' with the desired language code
        }
      }
    );

    if (response.status === 200) {
      const address = response.data.address;
      const houseNumber = address.house_number || '';
      const road = address.road || '';
      const city = address.city || address.town || '';
      const country = address.country || '';
      const formattedAddress =  `${road} ${houseNumber}, ${city}, ${country}`;
      return formattedAddress;
    } else {
      throw new Error('Unable to retrieve address');
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching the address');
  }
}


exports.getAddressCoordinates = async (address) =>{
  try {
    const encodedAddress = encodeURIComponent(address);
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      return { latitude, longitude };
    } else {
      throw new Error('No coordinates found for the address.');
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error.message);
    throw error;
  }
}


exports.getCoordsOfAddress = async(address)=>{
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
  try{
    const response = await axios.get(apiUrl);
    return response.data;
  }catch(error){
    console.log(error);
  }
}

exports.getAddressFromLatLngMapItem = async (lat, lng) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  try {
    const response = await axios.get(apiUrl);
    //const address = response.data.results[0].address_components[1].short_name;
    const add = response.data.results[0].formatted_address.split(",")[0];
    const address = add.split(" ")[0]
    return address;
  } catch (error) {
    console.error(error);
    return null;
  }
};

async function getStreetsInAlternative(route) {
  try {
    let streetsPerAlternative = new Set();
    let arrPerAlt = [];
    route.legs.map((leg) => {
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
  }
}

async function getBestAlternative(routes, origin, destination, preferences) {
  let maxWeight = 0;
  let bestIndex = 0;
  for (let i = 0; i < routes.length; i++) {
    const streetsInAlternative = await getStreetsInAlternative(routes[i]);
    const totalWeightInAlternative = await getFieldScoreForStreets(
      streetsInAlternative,
      preferences
    );
    console.log("route: " + i + " weight: " + totalWeightInAlternative)
    if (totalWeightInAlternative > maxWeight) {
      maxWeight = totalWeightInAlternative;
      bestIndex = i;
    }
  }
  console.log("bestIndex: " + bestIndex)
  return bestIndex;
}

async function getTotalWeightInAlternative(
  streetsInAlternative,
  preferences,
  req,
  res
) {
  const totalWeightInAlternative = await getFieldScoreForStreets(
    streetsInAlternative,
    preferences
  );
  console.log(totalWeightInAlternative);
  return totalWeightInAlternative;
}



exports.getDirections = async (origin, destination, preferences) => {
  const mode = "walking";
  const alternatives = true;
  const preferSideWalk = true;
  const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=${mode}&alternatives=${alternatives}`;
  try {
    const response = await axios.get(apiUrl);
    const ret = response.data;
    let routes = ret.routes;
    const bestAlternativeRouteIndex = await getBestAlternative(
      routes,
      origin,
      destination,
      preferences
    );
    return ret.routes[bestAlternativeRouteIndex];
  } catch (error) {
    console.error(error);
  }
};

exports.getXYListinBestRoute = async (origin, destination, preference) => {
  try {
    let arr = [];
    const response = await this.getDirections(origin, destination, preference);
    const data = response.legs[0];
    const steps = data.steps;
    const size = steps.length;

    arr.push({
      start_location: {
        x: data.start_location.lng,
        y: data.start_location.lat,
      },
    });
    arr.push({
      end_location: { x: data.end_location.lng, y: data.end_location.lat },
    });

    for (let i = 0; i < size; i++) {
      const index = i + 1;
      const xStart = steps[i].start_location.lng;
      const yStart = steps[i].start_location.lat;
      const xEnd = steps[i].end_location.lng;
      const yEnd = steps[i].end_location.lat;
      const strippedStr = steps[i].html_instructions.replace(/<\/?b>/g, "");
      arr.push({
        index: index,
        start: { x: xStart, y: yStart },
        end: { x: xEnd, y: yEnd },
      });
    }
    return arr;
  } catch (error) {
    console.error(error);
  }
};

exports.getInstructions = async (origin, destination, preference) => {
  try {
    let arr = [];
    const response = await this.getDirections(origin, destination, preference);
    const data = response.legs[0];
    const steps = data.steps;
    steps.map((step) => {
      const strippedStr = step.html_instructions.replace(/<\/?b>/g, "");
      arr.push({ instruction: strippedStr });
    });
    return arr;
  } catch (error) {
    console.log(error);
  }
};

exports.getDurationAndDistance = async(
  origin,
  destination,
  preference
)=>{
  try{
    const response = await this.getDirections(origin,destination,preference);
    const data = response.legs[0];
    const distance = data.distance.text;
    const duration = data.duration.text;
    return {distance: distance, duration: duration}
  }catch(error){
    console.log(error);
  }
}

exports.getWayPointsAndInstructions = async (
  origin,
  destination,
  preference
) => {
  try {
    const arr = [];
    const response = await this.getDirections(origin, destination, preference);
    const polyline = response.overview_polyline.points;
    const data = response.legs[0];
    const distance = data.distance.text;
    const duration = data.duration.text;
    const steps = data.steps;
    steps.map((step) => {
      const strippedStr = step.html_instructions.replace(/<[^>]+>/g, "");
      arr.push({
        start: {
          latitude: step.start_location.lat,
          longitude:step.start_location.lng,
        },
        end:{
          latitude: step.end_location.lat,
          longitude:step.end_location.lng
        },
        instruction: strippedStr,
      })
    });
    const retData = {
      arr: arr,
      points: polyline,
      distance: distance,
      duration: duration
    };
    return retData;
  } catch (error) {
    console.log(error);
  }
};
