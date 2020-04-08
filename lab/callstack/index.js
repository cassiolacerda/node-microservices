const express = require("express");
const fs = require("fs");
const app = express();

app.get("/", processRequest);

function processRequest(request, response) {
  readText(request, response);
  console.log("requisição terminou");
}

function readText(request, response) {
  fs.readFile("teste.txt", function (err, data) {
    if (err) {
      console.log("erro na leitura");
      return response.status(500).send("Erro ao ler o arquivo.");
    }
    response.write(data);
    response.end();
    console.log("leu arquivo");
  });

  console.log("lendo o arquivo, aguarde.");
}

app.listen(3000);
