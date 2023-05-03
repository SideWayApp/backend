const axios = require("axios");
const MapItem = require("../Models/MapItem");
require("dotenv").config();
const { getFormatedStreetName } = require("../Controllers/scraperController");
const {
  addMapItem,
  getMapItemsByType,
} = require("../Controllers/mongoMapItemsController");
const {getAddressFromLatLng,getAddressFromLatLngMapItem} = require('./directionsContorller');

exports.getAllLayersCodes = async () => {
  const apiUrl = `https://gisn.tel-aviv.gov.il/GisOpenData/service.asmx/GetLayersCodes`;
  try {
    const layerCodes = await axios.get(apiUrl);
    return layerCodes.data;
  } catch (error) {
    console.log(error);
  }
};

exports.getDataFromLayer = async (code) => {
  const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${code}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.features;
  } catch (error) {
    console.log(error);
  }
};

exports.getAllStreetsPerLayerCode = async (code) => {
  const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${code}`;
  let arr = [];
  try {
    const response = await axios.get(apiUrl);
    const features = response.data.features;
    const size = features.length;
    for (let i = 0; i < 5; i++) {
      let address = features[i].attributes.address;
      if (address === undefined) {
        address = features[i].attributes.street_name;
      }
      // let formatted = address;

      // if (address.slice(-1) === ' ') {
      // formatted = address.slice(0, -1);
      // }

      // formatted = formatted.replace(/\d+/g, '').trim();
      // //const englishFormatted = await getFormatedStreetName(formatted,"tel-aviv")
      arr.push({ index: i + 1, fullHebrewAddress: address });
    }
    return arr;
  } catch (error) {
    console.log(error);
  }
};

exports.hebrewAddressToEnglish = async (hebrewAddress) => {
  try {
    // let formatted = hebrewAddress;
    // if (hebrewAddress.slice(-1) === ' ') {
    // 	formatted = hebrewAddress.slice(0, -1);
    // }
    // formatted = formatted.replace(/\d+/g, '').trim();
    const englishFormatted = await getFormatedStreetName(
      hebrewAddress,
      "tel-aviv"
    );
    return englishFormatted;
  } catch (error) {
    console.log(error);
    console.log(hebrewAddress);
  }
};

exports.getAllItemsByTypeAndCode = async (code, type) => {
  try {
    const result = await this.getDataFromLayer(code);
    const size = result.length;
    let count = 0;
    let arr = [];
    let hebrew1;
    for (let i = 0; i < size; i++) {
      let hebrew = result[i].attributes.UniqueId;
      const city = 'Tel-Aviv';
      const latitude = result[i].geometry.y;
      const longitude = result[i].geometry.x;
      let flag = false;
      
      for (let j = 0; j < arr.length; j++){
        if (arr[j].hebrew === hebrew || arr[j].latitude == latitude || arr[j].longitude == longitude){
          flag = true;
          break;
        }
      }
      if (!flag){
        // const english = await getFormatedStreetName(hebrew,city);
        const english = await getAddressFromLatLng(latitude,longitude);
        let isEnglish = false;
        for (let k = 0; k < arr.length; k++){
          if (arr[k].formattedStreetName === english){
            isEnglish = true;
            break;
          }
        }
        if (!isEnglish){
          if (english.includes("St")){
            count++;
            arr.push({code: code, type: type, city: city,hebrew: hebrew, formattedStreetName: english, latitude: latitude, longitude: longitude})
          }
        }
      }
    }
    // hebrew: hebrew
    arr.push({count: count})
    return arr;
  } catch (error) {
    console.log(error);
  }
};

function findCircleCenter(coords) {
  const numCoords = coords.length;
  let sumX = 0;
  let sumY = 0;
  
  // Calculate sum of x and y coordinates
  for (let i = 0; i < numCoords; i++) {
    sumX += coords[i].x;
    sumY += coords[i].y;
  }
  
  // Calculate average of x and y coordinates
  const centerX = sumX / numCoords;
  const centerY = sumY / numCoords;
  
  return {x: centerX, y: centerY};
}

exports.addItemsToMongoPerTypeAndCode = async (code, type) => {
  try {
    const data = await this.getAllItemsByTypeAndCode(code, type);
    const size = data.length;
    let count = 0;
    for (let i = 0; i < size; i++) {
      if (data && data[i] && data[i].longitude && data[i].latitude) {
        const mapItem = await MapItem.findOne({ longitude: data[i].longitude , latitude: data[i].latitude });
        // console.log(mapItem)
        if (mapItem) {
          console.log("Item already in mongodb...");
        } else {
          count++;
          let address = data[i].formattedStreetName.split(",")[0];
          let addressParts = address.split(" ");
          let streetName = addressParts.slice(0, -1).join(" ");
          if(streetName.includes("St")){
            const result = await addMapItem(
              type,
              data[i].hebrew,
              // data[i].formattedStreetName,
              streetName,
              data[i].city,
              data[i].longitude,
              data[i].latitude,
            );
          }
        }
      }
    }
    console.log("Add items finished successfully...")
    return "All Good! " + count + " items added as " + type + "...";
  } catch (error) {
    console.log(error);
  }
};

exports.findMissingItemsFromMongoPerTypeAndCode = async (code, type) => {
  try {
    const data = await this.getDataFromLayer(code);
    const coordinates = data.map((item) => ({
      x: item.geometry.x.toString(),
      y: item.geometry.y.toString(),
    }));
    const dbItemsCoordinates = await getMapItemsByType(type);
    const result = coordinates.filter(
      (coord) =>
        !dbItemsCoordinates.some(
          (item) => item.x === coord.x && item.y === coord.y
        )
    );
    return result.length;
  } catch (error) {
    console.log(error);
  }
};
