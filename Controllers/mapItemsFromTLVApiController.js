const axios = require("axios")
const MapItem = require("../Models/MapItem")
require("dotenv").config()
const { getFormatedStreetName } = require("../Controllers/scraperController")
const { addMapItem } = require("../Controllers/mongoMapItemsController")

exports.getAllLayersCodes = async () => {
  const apiUrl = `https://gisn.tel-aviv.gov.il/GisOpenData/service.asmx/GetLayersCodes`;
  try {
    const layerCodes = await axios.get(apiUrl);
	return layerCodes.data;
  } catch (error) {
    console.log(error);
  }
};

exports.getDataFromLayer = async (code)=>{
	const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${code}`;
	try{
		const response = await axios.get(apiUrl);
		return response.data.features;
	}catch(error){
		console.log(error);
	}
}

exports.getAllStreetsPerLayerCode = async (code) => {
	const apiUrl = `https://api.tel-aviv.gov.il/gis/Layer?layerCode=${code}`;
	let arr = [];
	try{
		const response = await axios.get(apiUrl);
		const features = response.data.features;
		const size = features.length;
		for (let i =0; i < 5; i++){
			let address = features[i].attributes.address;
			if (address === undefined){
				address = features[i].attributes.street_name;
			}
			// let formatted = address;

			// if (address.slice(-1) === ' ') {
			// formatted = address.slice(0, -1);
			// }

			// formatted = formatted.replace(/\d+/g, '').trim();
			// //const englishFormatted = await getFormatedStreetName(formatted,"tel-aviv")
			arr.push({ index: i + 1, fullHebrewAddress: address})
		}
		return arr;
	}catch(error){
		console.log(error)
	}
}

exports.hebrewAddressToEnglish = async (hebrewAddress) =>	{
	try{
		// let formatted = hebrewAddress;
		// if (hebrewAddress.slice(-1) === ' ') {
		// 	formatted = hebrewAddress.slice(0, -1);
		// }
		// formatted = formatted.replace(/\d+/g, '').trim();
		const englishFormatted = await getFormatedStreetName(hebrewAddress,"tel-aviv")
		return englishFormatted;
	}catch(error){
		console.log(error);
		console.log(hebrewAddress)
	}
}	

exports.getAllItemsByTypeAndCode = async(code,type) => {
	try{
		const result = await this.getDataFromLayer(code);
		const size = result.length;
		let arr = [];
		for (let i=0; i < size; i++){
			let formatted = "";
			let address = result[i].attributes.address;
			if (arr.some(item => item.address === address)){
  				formatted = arr.find(item => item.address === address).formatted;
			}else{
				formatted = await this.hebrewAddressToEnglish(address);
			}
			const x = result[i].geometry.x;
			const y = result[i].geometry.y;
			if (!arr.some(item => item.x === x)) {
				if (formatted !== 'Tel Aviv-Yafo'){
					arr.push({address: address,hebrew: address, formatted: formatted,x: x, y: y, city: "Tel-Aviv",type: type});
				}
			}
		}
		return arr;
	}catch(error){
		console.log(error);
	}
}

exports.addItemsToMongoPerTypeAndCode = async (code,type) => {
	try{
		const data = await this.getAllItemsByTypeAndCode(code,type);
		const size = data.length;
		for (let i = 0; i < size; i++){
			const mapItem = await MapItem.findOne({ x: data[i].x, y: data[i].y })
			if (mapItem){
				console.log("Item already in mongodb...")
			}else{
				const result = await addMapItem(type,data[i].hebrew,data[i].formatted,data[i].city,data[i].x,data[i].y);
			}
		}
		return "All Good!";
	}catch(error){
		console.log(error)
	}
}
