require("dotenv-safe").config();

const express = require("express");
const AWS = require("aws-sdk");
const { Consumer } = require("sqs-consumer");

const service = express();
const Feedback = require("./lib/Feedback");

module.exports = (config) => {
  const feedback = new Feedback(config.data.feedback);

  const log = config.log();

  const listener = Consumer.create({
    queueUrl: process.env.QUEUE_URL,
    handleMessage: async (data) => {
      const { name, title, message } = JSON.parse(data.Body);
      try {
        await feedback.addEntry(name, title, message);
        console.log(`Feedback | SUCCESS: ${data.MessageId}`);
      } catch (err) {
        console.log(`Feedback | ERROR: ${err}`);
        return next(err);
      }
    },
    sqs: new AWS.SQS(),
  });

  listener.on("error", (err) => {
    console.error(err.message);
  });

  listener.on("processing_error", (err) => {
    console.error(err.message);
  });

  listener.start();

  // Add a request logging middleware in development mode
  if (service.get("env") === "development") {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.get("/list", async (req, res, next) => {
    try {
      return res.json(await feedback.getList());
    } catch (err) {
      return next(err);
    }
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
