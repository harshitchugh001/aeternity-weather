const Aeternity = require("./aeternity");
const { decode } = require("@aeternity/aepp-sdk");
const { fetchresponse } = require("./fetchresponse");
const BigNumber = require("bignumber.js");

class WeatherFeedOracle {
  constructor() {
    this.fundingAmount = 10000000000000000;
    this.ttl = 500;
    this.autoExtend = true;
    this.stopPollQueries = null;
  }

  init = async (keyPair = null, ttl = 500, autoExtend = true) => {
    this.ttl = ttl;
    this.autoExtend = autoExtend;
    this.aeternity = new Aeternity();
    await this.aeternity.init(keyPair);
    await this.aeternity.awaitFunding(this.fundingAmount);

    console.debug(
      "oracle client initialized with ttl:",
      this.ttl,
      "auto extend:",
      this.autoExtend
    );
  };

  register = async () => {
    if (!this.aeternity.client) throw Error("Client not initialized");

    if (!this.oracle)
      this.oracle = await this.aeternity.client
        .getOracleObject(this.aeternity.client.address.replace("ak_", "ok_"))
        .catch(() => null);
    if (!this.oracle)
      this.oracle = await this.aeternity.client.registerOracle(
        "string",
        "string",
        {
          oracleTtl: { type: "delta", value: this.ttl },
        }
      );

    console.log("oracle id", this.oracle.id);

    if (this.autoExtend) {
      await this.extendIfNeeded();
      this.extendIfNeededInterval = setInterval(async () => {
        await this.extendIfNeeded();
      }, (this.ttl / 5) * (60 / 3) * 1000); // every ttl/5 blocks
    }
  };

  extendIfNeeded = async () => {
    console.debug("checking to extend oracle");
    const height = await this.aeternity.client.getHeight();

    if (height > this.oracle.ttl - this.ttl / 5) {
      this.oracle = await this.oracle.extendOracle({
        type: "delta",
        value: this.ttl,
      });
      console.log(
        "extended oracle at height:",
        height,
        "new ttl:",
        this.oracle.ttl
      );
    } else {
      console.debug(
        "no need to extend oracle at height:",
        height,
        "ttl:",
        this.oracle.ttl
      );
    }
  };

  startPolling = async () => {
    if (!this.aeternity.client) throw Error("Client not initialized");

    this.stopPollQueries = this.oracle.pollQueries(
      (query) => this.respond(query).catch(console.error),
      {
        interval: 2000,
      }
    );
    console.debug("oracle query polling started");
  };

  respond = async (lat, lon) => {
    const height = await this.aeternity.client.getHeight();

    // Perform checks and log relevant information
    if (height >= this.oracle.ttl) {
      console.log("not responding to expired ttl");
      return;
    }

    const queryString = `lat:${lat},lon:${lon}`;
    console.log(
      "oracle got query",
      queryString,
      "height:",
      height,
      "ttl:",
      this.oracle.ttl
    );

    // Fetch the response based on the provided latitude and longitude
    const response = await fetchresponse(lat, lon).catch(console.error);

    if (response) {
      console.log("Received response:", response);

      // Uncomment and customize the following lines to respond to the Oracle query
      // const responseString = new BigNumber(response).toNumber().toString();
      // console.log("oracle will respond:", response, `raw: (${responseString})`);
      // await this.oracle
      //   .respondToQuery(query.id, responseString, {
      //     responseTtl: query.responseTtl,
      //   })
      //   .catch(console.error);
    } else {
      console.log("oracle will not respond, no result found in the response");
    }
  };

  stopPolling = () => {
    if (this.stopPollQueries) this.stopPollQueries();
    this.stopPollQueries = null;
    if (this.extendIfNeededInterval) clearInterval(this.extendIfNeededInterval);
    this.aeternity.stopAwaitFundingCheck();
    console.log("oracle query polling stopped");
  };

  isRunning = async () => {
    return (
      typeof this.stopPollQueries === "function" &&
      (await this.aeternity.client.height()) < this.oracle.ttl
    );
  };
}

module.exports = WeatherFeedOracle;
