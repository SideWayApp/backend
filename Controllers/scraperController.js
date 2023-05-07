const axios = require("axios");
const cheerio = require("cheerio");
const mongoController = require("./mongoStreetsController");

const cities = {
  TLV: "Tel-Aviv",
  Rishon: "Rishon Le-Zion",
};

const scrapeStreetsData = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const streets = [];
    $(`.col.py-1`).each((i, el) => {
      const street = $(el)
        .text()
        .replace(/[^a-zA-Z\s\u0590-\u05FF]/g, "")
        .trim();
      streets.push(street);
    });
    return streets;
  } catch (error) {
    console.error(error);
  }
};
exports.getScarpedStreets = async (req, res) => {
  console.log("getScarpedStreets");
  try {
    const st = [];
    const streets = await scrapeStreetsData(
      "https://www.ad.co.il/city/tel-aviv/streets"
    );
    streets.forEach((street) => {
      if (!st.includes(street) && street != "") {
        st.push(street);
      }
    });
    console.log(st.length);
    const formattedStreets = await pushStreets(st, cities.TLV);
    console.log("formattedStreets", formattedStreets.length);
    const created = await mongoController.createStreets(formattedStreets);

    console.log(created.length);

    res.send(created);
  } catch (error) {
    console.log(error);
  }
};

exports.getStreetsFromTLVGis = async (req, res) => {
  //  data.data.features:
  //  for each
  //  f.attributes:
  //   fieldAliases: {
  //     oid_rechov: 'זיהוי ממג רחוב',
  //     k_rechov: 'קוד רחוב',
  //     t_rechov: 'שם רחוב',
  //     shem_angli: 'שם אנגלי',
  //     ms_lamas: 'מספר למ"ס',
  //     t_sug: 'תיאור סוג כביש',
  //     k_kivun: 'קוד כוון',
  //     UniqueId: 'מזהה מערכת',
  //     shem_arvit: 'שם בערבית'
  //

  try {
    const url =
      "https://gisn.tel-aviv.gov.il/GisOpenData/service.asmx/GetLayer?layerCode=507&layerWhere=&xmin=&ymin=&xmax=&ymax=&projection=";
    const data = await axios.get(url);
    const features = data.data.features;
    const names = [];
    features.forEach((f) => {
      const tmp = f.attributes.t_rechov
        .replace(/[^a-zA-Z\s\u0590-\u05FF]/g, "")
        .trim();
      console.log(tmp);
      if (!names.includes(tmp) && tmp !== "") {
        names.push(tmp);
      }
    });
    //const streets = await pushStreets(names, cities.TLV);
    console.log("Scraped Streets len: ", streets.length);
    res.send(streets);
    // const created = await mongoController.createStreets(streets);
  } catch (error) {
    console.log(error);
  }
};

exports.pushStreets = async (names, city) => {
  const streets = await Promise.all(
    names.map(async (name) => {
      console.log("name: ", name);
      const formattedName = await getFormatedStreetName(name, city);
      console.log("formattedName", formattedName);
      return {
        name: formattedName,
        safe: 0,
        city: cities.TLV,
        clean: 0,
        scenery: 0,
        accessible: 0,
      };
    })
  );
  return streets;
};

exports.formateAllMongoStreets = async (req, res) => {
  try {
    const streets = await mongoController.getAllStreets();
    const nonEnglishStreets = streets.filter((street) => {
      const name = street.name;
      const isEnglish = !/^[A-Za-z\s'’\-]+$/.test(name);
      const isNotNumber = !/^\d+$/.test(name);
      return isEnglish && isNotNumber;
    });
    console.log(nonEnglishStreets.length);
    res.send(nonEnglishStreets);
  } catch (error) {
    console.log(error);
  }
};

exports.getFullStreetNameAndAddress = async(name, city)=>{
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const tmp = name + " " + city;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${tmp}&components=country:IL&types=route&key=${apiKey}`;
    const response = await axios.get(apiUrl);
    console.log(response.data)
    let arr = [];
    let isInArr = false;
    const res = response.data.results[0].address_components;    
    for (let i =0; i<res.length; i++){
      if (res[i].short_name.includes("St")){
        arr.push({shortName: res[i].short_name});
         isInArr = true;
         break; 
      }
    }
    if (!isInArr){
      arr.push({shortName: response.data.results[0].address_components[0].short_name});
    }
    arr.push({address:response.data.results[0].formatted_address,location:response.data.results[0].geometry.location});
    return arr; 
  }catch(error){
    console.log(error)
  }
}

exports.getFormatedStreetName = async (name, city) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const tmp = name + " " + city;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${tmp}&components=country:IL&types=route&key=${apiKey}`;
    const response = await axios.get(apiUrl);
    const res = response.data.results[0].address_components;    
    for (let i =0; i<res.length; i++){
      if (res[i].short_name.includes("St")){
        return res[i].short_name;
      }
    }
    return response.data.results[0].address_components[0].short_name;
  } catch (error) {
    console.log(error);
  }
};

exports.removeDuplicateStreets = async (req, res) => {
  const duplicate = await mongoController.removeDuplicates();
  res.send(duplicate);
};
