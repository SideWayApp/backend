const axios = require("axios");
require("dotenv").config();
const { getFormatedStreetName } = require('../Controllers/scraperController')
const { addMapItem } = require('../Controllers/mongoMapItemsController');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const layerCode = 506; //מצלמות בטחון
exports.getAllCamerasFromTLVApi = async (req,res) => {
    const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${layerCode}`
    try {
        const response = await axios.get(apiUrl);
        const features = response.data.features;
        const tlv = "תל אביב"
        for (let i = 0; i < 1; i++){
            const streetNameInHeberw = features[i].attributes.address;
            const parts = streetNameInHeberw.split(" ");
            parts.pop();
            parts.pop();
            console.log(parts)
            let formattedNameInHebrew = parts.join(" ");
            console.log(formattedNameInHebrew)
            const streetNameInEnglish = await getFormatedStreetName(formattedNameInHebrew,tlv);
            const x = features[i].geometry.x;
            const y = features[i].geometry.y;
            const result = await addMapItem("camera", streetNameInEnglish, "Tel-Aviv",x,y);
            console.log(result)
        }
    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
