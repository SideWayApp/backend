const axios = require("axios");
const cheerio = require("cheerio");
const mongoController = require("../controllers/mongoController");

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
      const street = {
        name: $(el).text().trim(),
        clean: 1,
        safe: 1,
        scenery: 1,
        accessible: 1,
        total: 1,
      };
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
    const streets = await scrapeStreetsData(
      "https://www.ad.co.il/city/tel-aviv/streets"
    );
    console.log(streets);
    res.send(streets);
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
    const streets = [];
    features.forEach((f) => {
      if (!names.includes(f.attributes.shem_angli)) {
        names.push(f.attributes.shem_angli);
      }
    });

    names.forEach((name) => {
      const street = {
        name: name,
        safe: 0,
        city: cities.TLV,
        clean: 0,
        scenery: 0,
        accessible: 0,
        total: 0,
      };

      streets.push(street);
    });

    const created = await mongoController.createStreets(streets);
    res.send(created);
  } catch (error) {
    console.log(error);
  }
};
