const https = require("https");
const options = {
  hostname: "www.google.com.br",
  port: 443,
  path: "/about/",
  method: "GET",
};
const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on("data", (d) => {
    process.stdout.write(d);
  });
});
req.on("error", (error) => {
  console.error(error);
});
req.end();
