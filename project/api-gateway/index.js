require("dotenv-safe").config();

var jwt = require("jsonwebtoken");
var http = require("http");
var express = require("express");
var httpProxy = require("express-http-proxy");
var app = express();
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var helmet = require("helmet");

function verifyJWT(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    req.userId = decoded.id;
    next();
  });
}

var movieServiceProxy = httpProxy("http://localhost:3001");
var cinemaCatalogServiceProxy = httpProxy("http://localhost:3002");

app.use("/ms-1", verifyJWT, (req, res, next) => {
  movieServiceProxy(req, res, next);
});

app.use("/ms-2", verifyJWT, (req, res, next) => {
  cinemaCatalogServiceProxy(req, res, next);
});

app.use(logger("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post("/login", (req, res, next) => {
  if (req.body.user === "cassio" && req.body.pwd === "123") {
    const id = 1; //esse id viria do banco de dados
    var token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 120,
    });
    res.status(200).send({ auth: true, token: token });
  }
  res.status(500).send("Login inválido!");
});

app.get("/logout", function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

var server = http.createServer(app);
server.listen(3000);
