const axios = require("axios")
const MapItem = require("../Models/MapItem")
require("dotenv").config()
const { getFormatedStreetName,getAllFormatedStreetNames } = require("../Controllers/scraperController")
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
		const size = features.length-1;
		for (let i =0; i < 5; i++){
			const address = features[i].attributes.address;
			const lastIndex = address.length - 1;
			let formatted = address;

			if (address.slice(-1) === ' ') {
			formatted = address.slice(0, -1);
			}

			formatted = formatted.replace(/\d+/g, '').trim();
			const englishFormatted = await getFormatedStreetName(formatted,"tel-aviv")
			arr.push({ index: i + 1, fullHebrewAddress: address, hebrew: formatted, english:englishFormatted });
		}
		return arr;
	}catch(error){
		console.log(error)
	}
}

exports.hebrewAddressToEnglish = async (hebrewAddress) =>	{
	try{
		let formatted = hebrewAddress;
		if (hebrewAddress.slice(-1) === ' ') {
		formatted = hebrewAddress.slice(0, -1);
		}
		formatted = formatted.replace(/\d+/g, '').trim();
		const englishFormatted = await getFormatedStreetName(formatted,"tel-aviv")
		return englishFormatted;
	}catch(error){
		console.log(error);
	}
}

exports.getAllItemsByTypeAndCode = async(code,type) => {
	try{
		const layerCodeData = await this.getDataFromLayer(code);
		const size = layerCodeData.length;
		let addressArr = [];
		for (let i=0; i < size; i++){
			const address = layerCodeData[i].attributes.address;
			const addressInEnglish = await this.hebrewAddressToEnglish(address);
			const x = layerCodeData[i].geometry.x;
			const y = layerCodeData[i].geometry.y;
			addressArr.push({index: i+1,type:type,city:"tel-aviv", hebrew:address,english:addressInEnglish,x:x,y:y});
		}
		return addressArr;
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
				continue
			}else{
				const result = await addMapItem(type,data[i].english,data[i].city,data[i].x,data[i].y);
				continue
			}
		}
	}catch(error){
		console.log(error)
	}
}
