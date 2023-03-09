const app = require("../server");
const request = require("supertest");

beforeAll((done) => {
  done();
});

afterAll((done) => {
  done();
});

describe("Testing Scraper API", () => {
  test("getStreetsFromTLVGis", async () => {
    const res = await request(app).post("/scrape/TLV-StreetsGIS");
    expect(res.statusCode).toEqual(200);
  });
});
