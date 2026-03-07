const mongoose = require("mongoose");

async function connectMongo() {
  const mongoUri = String(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cmr_smart_portal"
  ).trim();

  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });
}

module.exports = {
  connectMongo
};
