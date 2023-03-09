const axios = require("axios");
const cheerio = require("cheerio");

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
  try {
    const url =
      "https://gisn.tel-aviv.gov.il/GisOpenData/service.asmx/GetLayer?layerCode=507&layerWhere=&xmin=&ymin=&xmax=&ymax=&projection=";
    const data = await axios.get(url);
    console.log(data.data);
    const features = data.data.features;
    const streets = [];
    features.forEach((f) => {
      //console.log(f.attributes);
      const tmp = f.attributes.shem_angli;
      if (!streets.includes(tmp)) {
        streets.push(tmp);
      }
    });
    res.send(streets);
    // console.log(streets);
  } catch (error) {
    console.log(error);
  }
};
