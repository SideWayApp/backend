const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const streetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  clean: [scoreSchema],
  safe: [scoreSchema],
  scenery: [scoreSchema],
  accessible: [scoreSchema],
});

// Define a virtual field for the 'total' score
streetSchema.virtual("total").get(function () {
  const cleanSum = this.clean.reduce((sum, obj) => sum + obj.score, 0);
  const safeSum = this.safe.reduce((sum, obj) => sum + obj.score, 0);
  const scenerySum = this.scenery.reduce((sum, obj) => sum + obj.score, 0);
  const accessibleSum = this.accessible.reduce(
    (sum, obj) => sum + obj.score,
    0
  );
  const count = Math.max(
    this.clean.length,
    this.safe.length,
    this.scenery.length,
    this.accessible.length
  );
  const cleanAvg = count > 0 ? cleanSum / count : 0;
  const safeAvg = count > 0 ? safeSum / count : 0;
  const sceneryAvg = count > 0 ? scenerySum / count : 0;
  const accessibleAvg = count > 0 ? accessibleSum / count : 0;
  return (cleanAvg + safeAvg + sceneryAvg + accessibleAvg) / 4;
});

streetSchema.virtual("totalClean").get(function () {
  return this.clean.reduce((total, score) => total + score.score, 0);
});

streetSchema.virtual("totalSafe").get(function () {
  return this.safe.reduce((total, score) => total + score.score, 0);
});

streetSchema.virtual("totalScenery").get(function () {
  return this.scenery.reduce((total, score) => total + score.score, 0);
});

streetSchema.virtual("totalAccessible").get(function () {
  return this.accessible.reduce((total, score) => total + score.score, 0);
});


const Street = mongoose.model("Street", streetSchema);

module.exports = Street;
