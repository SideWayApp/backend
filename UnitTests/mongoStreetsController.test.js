const app = require("../server");
const mongoose = require("mongoose");
const {
  createStreet,
  getAllStreets,
  deleteStreet,
  updateStreet,
  getSingleStreet,
  getFieldScoreForStreets,
} = require("../Controllers/mongoStreetsController");
const Street = require("../Models/Street");
beforeAll(async () => {
  await Street.deleteMany({ name: "Main Street" });
});

afterEach(async () => {});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

describe("Testing Mongo Streets Controller", () => {
  test("should create a new street document", async () => {
    const streetData = {
      name: "Main Street",
      city: "Anytown",
      clean: [],
      safe: [],
      scenery: [],
      accessible: [],
    };

    const newStreet = await createStreet(streetData);
    expect(newStreet).toBeDefined();
    expect(newStreet.name).toBe(streetData.name);
    expect(newStreet.city).toBe(streetData.city);
    expect(newStreet.clean).toEqual([]);
    expect(newStreet.safe).toEqual([]);
    expect(newStreet.scenery).toEqual([]);
    expect(newStreet.accessible).toEqual([]);
    expect(newStreet.total).toBe(0);
  });

  test("should update street scores", async () => {
    const streetName = "Main Street";
    const city = "Anytown";
    const updateSt = { clean: 5, safe: 4, scenery: 4, accessible: 3 };
    const update = await updateStreet(city, streetName, updateSt);
    expect(update).toBeDefined();
    expect(update.clean.length).toBe(1);
    expect(update.safe.length).toBe(1);
    expect(update.scenery.length).toBe(1);
    expect(update.accessible.length).toBe(1);
    expect(update.total).toBe(
      (updateSt.clean +
        updateSt.safe +
        updateSt.scenery +
        updateSt.accessible) /
        4
    );
  });

  test("should throw an error if required fields are missing", async () => {
    const streetData = {
      name: "Main Street",
    };

    await expect(createStreet(streetData)).rejects.toThrow();
  });

  test("should get a single street", async () => {
    const streetData = {
      name: "Main Street",
      city: "Anytown",
    };
    const street = await getSingleStreet(streetData.city, streetData.name);
    expect(street).toBeDefined();
    expect(street.name).toBe(streetData.name);
    expect(street.city).toBe(streetData.city);
    expect(street.clean.length).toBe(1);
    expect(street.safe.length).toBe(1);
    expect(street.scenery.length).toBe(1);
    expect(street.accessible.length).toBe(1);
  });

  test("should return an array of streets", async () => {
    const city = "Anytown";
    const res = await getAllStreets(city);
    expect(res).toBeDefined();
  });

  test("Test deleteCount, ", async () => {
    const result = await deleteStreet("Anytown", "Main Street");
    expect(result.deletedCount).toEqual(1);

    const result2 = await deleteStreet("Anytown", "Main treet");
    expect(result2.deletedCount).toEqual(0);
  });

  test("should return a number", async () => {
    const arr = ["LOUIS MARSHALL", "BRANDEIS", "PINKAS", "REMEZ"];
    const fields = {
      total: "total",
      clean: "clean",
      safe: "safe",
      scenery: "scenery",
      accessible: "accessible",
    };
    const total = await getFieldScoreForStreets(arr, fields.total);
    expect(total).toBeDefined();
    expect(typeof total).toBe("number");
    const clean = await getFieldScoreForStreets(arr, fields.clean);
    expect(clean).toBeDefined();
    expect(typeof clean).toBe("number");
    const safe = await getFieldScoreForStreets(arr, fields.safe);
    expect(safe).toBeDefined();
    expect(typeof safe).toBe("number");
    const scenery = await getFieldScoreForStreets(arr, fields.scenery);
    expect(scenery).toBeDefined();
    expect(typeof scenery).toBe("number");
    const accessible = await getFieldScoreForStreets(arr, fields.accessible);
    expect(typeof accessible).toBe("number");
  });
});
