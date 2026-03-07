require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`CMR Smart Presentation backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
