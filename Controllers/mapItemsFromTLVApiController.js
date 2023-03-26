const axios = require("axios");
const MapItem = require("../Models/MapItem")
require("dotenv").config();
const { getFormatedStreetName } = require('../Controllers/scraperController')
const { addMapItem } = require('../Controllers/mongoMapItemsController');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const layerCode = 506; //מצלמות בטחון
exports.getAllCamerasFromTLVApiAddToMongo = async (req,res) => {
    const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${layerCode}`
    try {
        const response = await axios.get(apiUrl);
        const features = response.data.features;
        const tlv = "תל אביב"
        let counter = 0;
        for (let i = 0; i < features.length; i++){
            const streetNameInHeberw = features[i].attributes.address;
            const parts = streetNameInHeberw.split(" ");
            parts.pop();
            parts.pop();
            if (parts[0] === "" || parts[0] === " "){
                parts.shift();
            }
            let formattedNameInHebrew = parts.join(" ");
            const x = features[i].geometry.x;
            const y = features[i].geometry.y;
            const mapItem = await MapItem.findOne({x: x, y:y});
            if (mapItem){
                console.log("camera already in mongodb...")
                continue
            }else{
                const streetNameInEnglish = await getFormatedStreetName(formattedNameInHebrew,tlv);
                const result = await addMapItem("camera", streetNameInEnglish, "Tel-Aviv",x,y);
                continue
            }
        }
        return res.status(200).json({ message: "Success" });
    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
