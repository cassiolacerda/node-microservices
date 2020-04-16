/* eslint-disable class-methods-use-this */
const url = require("url");
const axios = require("axios");
const crypto = require("crypto");
const AWS = require("aws-sdk");

const sqs = new AWS.SQS({
  apiVersion: "2012-11-05",
});

const CircuitBreaker = require("../lib/CircuitBreaker");

const circuitBreaker = new CircuitBreaker();

class FeedbackService {
  constructor({ serviceRegistryUrl, serviceVersionIdentifier }) {
    this.serviceVersionIdentifier = serviceVersionIdentifier;
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.cache = {};
  }

  async addEntry(name, title, message) {
    const queueUrl = process.env.QUEUE_URL;

    let orderData = {
      name: name,
      title: title,
      message: message,
    };

    let sqsOrderData = {
      MessageAttributes: {
        name: {
          DataType: "String",
          StringValue: orderData.name,
        },
        title: {
          DataType: "String",
          StringValue: orderData.title,
        },
        message: {
          DataType: "String",
          StringValue: orderData.message,
        },
      },
      MessageBody: JSON.stringify(orderData),
      QueueUrl: queueUrl,
    };

    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    sendSqsMessage
      .then((data) => {
        console.log(`Feedback | SUCCESS: ${data.MessageId}`);
        return true;
      })
      .catch((err) => {
        console.log(`Feedback | ERROR: ${err}`);
        return false;
      });
  }

  async getList() {
    const { ip, port } = await this.getService("feedback-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/list`,
    });
  }

  async callService(requestOptions) {
    const parsedUrl = url.parse(requestOptions.url);
    const cacheKey = crypto
      .createHash("md5")
      .update(requestOptions.method + parsedUrl.path)
      .digest("hex");

    const result = await circuitBreaker.callService(requestOptions);

    if (!result) {
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      return null;
    }

    this.cache[cacheKey] = result;
    return result;
  }

  async getService(servicename) {
    const response = await axios.get(
      `${this.serviceRegistryUrl}/find/${servicename}/${this.serviceVersionIdentifier}`
    );
    return response.data;
  }
}

module.exports = FeedbackService;
