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
      "https://www.ad.co.il/city/rishon-lezion/streets"
    );
    streets.forEach((street) => {
      if (!st.includes(street) && street != "") {
        st.push(street);
      }
    });
    const chunkSize = Math.ceil(st.length / 3); // calculate the chunk size
    for (let i = chunkSize * 2; i < st.length; i += chunkSize) {
      const tmp = st.slice(i, i + chunkSize);
      const formattedStreets = await this.pushStreets(tmp, cities.Rishon);
      const filtered = formattedStreets.filter((street) => {
        const regex = /[\u0590-\u05FF]+/;
        return (
          street.name.includes("St") ||
          regex.test(street.name) ||
          street.name.includes("Blvd")
        );
      });
      const created = await mongoController.createStreets(filtered);
      console.log(created.length);
    }

    res.send("Done");
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
    const streets = await pushStreets(names, cities.Rishon);
    console.log("Scraped Streets len: ", streets.length);
    const created = await mongoController.createStreets(streets);
    res.send(created);
  } catch (error) {
    console.log(error);
  }
};

exports.pushStreets = async (names, city) => {
  const streets = await Promise.all(
    names.map(async (name) => {
      const formattedName = await this.getFormatedStreetName(name, city);
      return {
        name: formattedName,
        city: cities.Rishon,
        safe: [],
        clean: [],
        scenery: [],
        accessible: [],
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

exports.getFormatedStreetName = async (name, city) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const tmp = name + " " + city;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${tmp}&components=country:IL&types=route&key=${apiKey}`;
    const response = await axios.get(apiUrl);
    // const res = response.data.results[0].address_components;
    return response.data.results[0].address_components[0].short_name;
  } catch (error) {
    console.log(error);
  }
};

exports.removeDuplicateStreets = async (req, res) => {
  const duplicate = await mongoController.removeDuplicates();
  res.send(duplicate);
};

exports.getStreetsFromRISHONGis = async (req, res) => {
  console.log("getStreetsFromRISHONGis");
  const url =
    "https://v5.gis-net.co.il/proxy/proxy.ashx?http://arcgis006/arcgis/rest/services/rishon_le_zion/rishon_le_zion_maindata_new/MapServer/15/query?f=json&text=%25&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects";
  const data = await axios.get(url);
  console.log(data.data.features.length);
  const features = data.data.features;
  const ret = [];
  for (const feature of features) {
    const tmp = feature.attributes.LEGAL_NAME;
    if (!ret.includes(tmp) && tmp != "" && tmp != undefined) {
      ret.push(tmp);
    }
  }
  console.log(ret.length);

  res.send(ret);
};
