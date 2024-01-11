const {
    Node,
    MemoryAccount,
    generateKeyPair,
    AeSdk,
    toAe,
} = require("@aeternity/aepp-sdk");
const fs = require("fs").promises;
const path = require("path");
const qrcode = require("qrcode-terminal");
const BigNumber = require("bignumber.js");
require('dotenv').config();

const url = "https://testnet.aeternity.io/";

module.exports = class Aeternity {
    stopAwaitFunding = false;

    init = async () => {
        if (!this.client) {
            const publicKey = process.env.PUBLIC_KEY;
            const secretKey = process.env.SECRET_KEY;
            console.log(publicKey);


            if (!publicKey || !secretKey) {
                throw new Error("Public key or secret key not provided in environment variables.");
            }

            this.client = new AeSdk({
                nodes: [
                    {
                        name: "node",
                        instance: new Node(process.env.NODE_URL || url),
                    },
                ],
                accounts: [
                    new MemoryAccount(secretKey),
                ],
            });
        }
    };

    stopAwaitFundingCheck = () => {
        this.stopAwaitFunding = true;
    };

    timeoutAwaitFunding = (fundingAmount) => {
        if (!this.stopAwaitFunding)
            setTimeout(() => {
                void this.awaitFunding(fundingAmount);
            }, 120 * 1000);
    };

    awaitFunding = async (fundingAmount) => {
        if (!this.client) throw Error("Client not initialized");

        if (
            new BigNumber(
                await this.client.getBalance(this.client.address),
            ).isLessThan(new BigNumber(fundingAmount).dividedBy(2))
        ) {
            qrcode.generate(this.client.address, { small: true });
            console.log(
                "Fund Oracle Service Wallet",
                this.client.address,
                toAe(fundingAmount),
                "AE",
            );
            await new Promise((resolve) => {
                const interval = setInterval(async () => {
                    if (
                        new BigNumber(
                            await this.client.getBalance(this.client.address),
                        ).isGreaterThanOrEqualTo(fundingAmount)
                    ) {
                        console.log("received funding");
                        this.timeoutAwaitFunding(fundingAmount);
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 2000);
            });
        } else {
            this.timeoutAwaitFunding(fundingAmount);
        }
    };
};
