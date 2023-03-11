const app = require("../server");
const request = require("supertest");
const mongoose = require("mongoose");
const {
  createStreet,
  getAllStreets,
  deleteStreet,
  updateStreet,
  getSingleStreet,
} = require("../Controllers/mongoController");
const Street = require("../models/Street");
beforeAll(async () => {
  await Street.deleteMany({ name: "Main Street" });
});

afterEach(async () => {});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

describe("Testing Mongo Controller", () => {
  test("should create a new street document", async () => {
    const streetData = {
      name: "Main Street",
      city: "Anytown",
      clean: 4,
      safe: 3,
      scenery: 5,
      accessible: 2,
      total: 14,
    };

    const newStreet = await createStreet(streetData);

    expect(newStreet).toBeDefined();
    expect(newStreet.name).toBe(streetData.name);
    expect(newStreet.city).toBe(streetData.city);
    expect(newStreet.clean).toBe(streetData.clean);
    expect(newStreet.safe).toBe(streetData.safe);
    expect(newStreet.scenery).toBe(streetData.scenery);
    expect(newStreet.accessible).toBe(streetData.accessible);
    expect(newStreet.total).toBe(streetData.total);

    const updateSt = { clean: 5, safe: 4, scenery: 4, accessible: 3 };
    const update = await updateStreet(newStreet.name, updateSt);

    expect(update.matchedCount).toEqual(1);

    const updatedStreet = await Street.findOne({ name: newStreet.name });
    expect(updatedStreet.name).toEqual(newStreet.name);
    expect(updatedStreet.city).toEqual(newStreet.city);
    expect(updatedStreet.clean).toEqual(updateSt.clean);
    expect(updatedStreet.safe).toEqual(updateSt.safe);
    expect(updatedStreet.scenery).toEqual(updateSt.scenery);
    expect(updatedStreet.accessible).toEqual(updateSt.accessible);
    expect(updatedStreet.total).toEqual(newStreet.total);
  });

  test("should get a single street", async () => {
    const streetData = {
      name: "Main Street",
      city: "Anytown",
      clean: 5,
      safe: 4,
      scenery: 4,
      accessible: 3,
      total: 14,
    };

    const street = await getSingleStreet(streetData.name);
    expect(street).toBeDefined();
    expect(street.name).toBe(streetData.name);
    expect(street.city).toBe(streetData.city);
    expect(street.clean).toBe(streetData.clean);
    expect(street.safe).toBe(streetData.safe);
    expect(street.scenery).toBe(streetData.scenery);
    expect(street.accessible).toBe(streetData.accessible);
    expect(street.total).toBe(streetData.total);
  });

  test("should throw an error if required fields are missing", async () => {
    const streetData = {
      name: "Main Street",
      clean: 4,
      safe: 3,
      scenery: 5,
      accessible: 2,
      total: 14,
    };

    await expect(createStreet(streetData)).rejects.toThrow();
  });

  test("should return an array of streets", async () => {
    const res = await getAllStreets();
    expect(res).toBeDefined();
  });

  test("Test deleteCount, ", async () => {
    const result = await deleteStreet("Main Street");
    expect(result.deletedCount).toEqual(1);

    const result2 = await deleteStreet("Main treet");
    expect(result2.deletedCount).toEqual(0);
  });
});
