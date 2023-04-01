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

exports.getAllItemsByTypeAndCode = async(code,type) => {
	try{
		const layerCodeData = await this.getDataFromLayer(code);
		const size = layerCodeData.length;
		let addressArr = [];
		for (let i=0; i < 1; i++){
			const lastIndex = layerCodeData[i].attributes.address.length-1
			const x = layerCodeData[i].geometry.x
			const y = layerCodeData[i].geometry.y
			if (layerCodeData[i].attributes.address[lastIndex] === ' '){
				let address = layerCodeData[i].attributes.address;
				address = address.substring(0, address.length - 1);
				const streetName = address.replace(/\d+/g, '').trim();
				const addressInEnglish = await getFormatedStreetName(streetName,"tel-aviv")
				addressArr.push({index: i+1,type:type,city:"tel-aviv", hebrew:address,english:addressInEnglish,x:x,y:y});
			}else{
				const streetName = layerCodeData[i].attributes.address.replace(/\d+/g, '').trim();
				const addressInEnglish = await getFormatedStreetName(streetName,"tel-aviv")
				addressArr.push({index: i+1,type:type, city: "tel-aviv",hebrew:layerCodeData[i].attributes.address,english:addressInEnglish,x:x,y:y});
			}
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
