const axios = require("axios");
const cheerio = require("cheerio");

const scrapeStreetsData = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(response.data);
    const streets = [];
    $(`.col.py-1`, html).each((i, el) => {
      console.log(el);
      const street = {
        name: $(el).text().trim(),
        url: $(el).attr("href"),
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
