// Import required modules and set environment variables
const axios = require("axios");
const MapItem = require("../Models/MapItem")
require("dotenv").config();
const { getFormatedStreetName } = require('../Controllers/scraperController')
const { addMapItem } = require('../Controllers/mongoMapItemsController');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const layerCode = 506; //מצלמות בטחון
//layer codes api = https://gisn.tel-aviv.gov.il/GisOpenData/service.asmx/GetLayersCodes
// Define an async function to get all cameras from the TLV API and add them to MongoDB
exports.getAllCamerasFromTLVApiAddToMongo = async (req, res) => {
    // Define the API URL
    const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${layerCode}`
    try {
        // Make an HTTP GET request to the API URL
        const response = await axios.get(apiUrl);
        // Extract the list of camera features from the API response
        const features = response.data.features;
        // Set a variable to store the name of the city
        const tlv = "תל אביב"
        // Initialize a counter variable for debugging purposes
        let counter = 0;
        // Loop through each camera feature
        for (let i = 0; i < features.length; i++){
            // Extract the Hebrew street name from the feature's attributes
            const streetNameInHeberw = features[i].attributes.address;
            // Split the Hebrew street name into parts and remove the last two parts (which are the street number and city name)
            const parts = streetNameInHeberw.split(" ");
            parts.pop();
            parts.pop();
            // Remove any leading whitespace from the first part of the street name
            if (parts[0] === "" || parts[0] === " "){
                parts.shift();
            }
            // Join the remaining parts of the street name to create a formatted Hebrew street name
            let formattedNameInHebrew = parts.join(" ");
            // Extract the X and Y coordinates of the camera feature
            const x = features[i].geometry.x;
            const y = features[i].geometry.y;
            // Check if a MapItem with the same X and Y coordinates already exists in MongoDB
            const mapItem = await MapItem.findOne({x: x, y:y});
            if (mapItem){
                // If a MapItem with the same X and Y coordinates already exists, log a message and continue to the next feature
                console.log("camera already in mongodb...")
                continue
            }else{
                // If a MapItem with the same X and Y coordinates does not already exist, get the formatted English street name using the scraperController and add the MapItem to MongoDB using the mongoMapItemsController
                const streetNameInEnglish = await getFormatedStreetName(formattedNameInHebrew,tlv);
                const result = await addMapItem("camera", streetNameInEnglish, "Tel-Aviv",x,y);
                continue
            }
        }
        // If all camera features have been processed successfully, return a success message
        return res.status(200).json({ message: "Success" });
    } catch(error){
        // If an error occurs, log the error and return an error message
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
