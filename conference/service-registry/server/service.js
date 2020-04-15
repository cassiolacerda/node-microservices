const express = require("express");

const service = express();
const ServiceRegistry = require("./lib/ServiceRegistry");

module.exports = (config) => {
  const log = config.log();
  const serviceRegistry = new ServiceRegistry(log);

  if (service.get("env") === "development") {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.put(
    "/register/:servicename/:serviceversion/:serviceport",
    (req, res) => {
      const { servicename, serviceversion, serviceport } = req.params;

      const serviceip = req.connection.remoteAddress.includes("::")
        ? `[${req.connection.remoteAddress}]`
        : req.connection.remoteAddress;

      const servicekey = serviceRegistry.register(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      );

      return res.json({ result: servicekey });
    }
  );

  service.delete(
    "/register/:servicename/:serviceversion/:serviceport",
    (req, res) => {
      const { servicename, serviceversion, serviceport } = req.params;

      const serviceip = req.connection.remoteAddress.includes("::")
        ? `[${req.connection.remoteAddress}]`
        : req.connection.remoteAddress;

      const servicekey = serviceRegistry.unregister(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      );

      return res.json({ result: servicekey });
    }
  );

  service.get("/find/:servicename/:serviceversion", (req, res) => {
    const { servicename, serviceversion } = req.params;
    const svs = serviceRegistry.get(servicename, serviceversion);
    if (!svs) return res.status(404).json({ result: "Service not found" });
    return res.json(svs);
  });

  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });

  return service;
};
