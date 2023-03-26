const app = require("../server");
const mongoose = require("mongoose");
const {
  addMapItem,
  updateMapItem,
  getMapItemsByType,
  deleteMapItem,
  getAllMapItemsByCity,
} = require("../Controllers/mongoMapItemsController");
const e = require("express");
beforeAll((done) => {
  done();
});

afterEach(async () => {});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

describe("Testing Mongo Streets Controller", () => {
  const mapItemData = {
    type: "camera",
    streetName: "Main Street",
    city: "Los Angeles",
    x: "34.75983054059476",
    y: "32.044220466961974",
  };
  test("Testing Add Map Item ", async () => {
    const result = await addMapItem(
      mapItemData.type,
      mapItemData.streetName,
      mapItemData.city,
      mapItemData.x,
      mapItemData.y,
    );
    expect(result).toBeDefined();
    expect(result.type).toBe(mapItemData.type);
    expect(result.streetName).toBe(mapItemData.streetName);
    expect(result.city).toBe(mapItemData.city);
    expect(result.x).toBe(mapItemData.x);
    expect(result.y).toBe(mapItemData.y);
    
    const id = result._id;
    const updateValues = {
      type: "Tree",
      streetName: "Second Street",
      city: "Los Angeles",
      x: "34.75983054059476",
      y: "32.044220466961974",
    };
    const updatedResult = await updateMapItem(id, updateValues);
    expect(updatedResult).toBeDefined();
    expect(updatedResult.type).toBe(updateValues.type);
    expect(updatedResult.streetName).toBe(updateValues.streetName);
    expect(updatedResult.city).toBe(updateValues.city);
    expect(updatedResult.x).toBe(updateValues.x);
    expect(updatedResult.y).toBe(updateValues.y);
    expect(updatedResult._id).toEqual(id);

    const getItemsByType = await getMapItemsByType(updatedResult.type);
    expect(getItemsByType).toBeDefined();
    expect(getItemsByType.length).toBeGreaterThanOrEqual(0);

    const getItemsByCity = await getAllMapItemsByCity(updatedResult.city);
    expect(getItemsByCity).toBeDefined();
    expect(getItemsByCity.length).toBeGreaterThanOrEqual(0);

    const deleteResult = await deleteMapItem(id);
    expect(deleteResult).toBeDefined();
    expect(deleteResult._id).toEqual(id);
  });
});
