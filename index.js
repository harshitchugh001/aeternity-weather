const WeatherFeedOracle = require("./src/WeatherFeedOracle");

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const main = async () => {
  const weatherfeedoracle = new WeatherFeedOracle();
  await weatherfeedoracle.init();
  await weatherfeedoracle.register();
  await weatherfeedoracle.startPolling();
  // await weatherfeedoracle.respond("21","56");
};

void main();