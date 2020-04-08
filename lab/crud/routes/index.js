var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  global.db.findAll((err, docs) => {
    if (err) {
      return console.log(err);
    }
    res.render("index", { docs });
  });
});

router.get("/new", function (req, res) {
  res.render("new", {
    title: "Cadastro de Cliente",
    doc: {},
    action: "/new",
  });
});

router.post("/new", function (req, res) {
  const nome = req.body.nome;
  const idade = parseInt(req.body.idade);
  const uf = req.body.uf;
  global.db.insert({ nome, idade, uf }, (err, result) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/?new=true");
  });
});

router.get("/edit/:id", function (req, res) {
  var id = req.params.id;
  global.db.findOne(id, (err, doc) => {
    if (err) {
      return console.log(err);
    }
    console.log(doc.nome);
    res.render("new", {
      title: "Edição de Cliente",
      doc: doc,
      action: "/edit/" + doc._id,
    });
  });
});

router.post("/edit/:id", function (req, res) {
  const id = req.params.id;
  const nome = req.body.nome;
  const idade = parseInt(req.body.idade);
  const uf = req.body.uf;
  global.db.update(id, { nome, idade, uf }, (err, result) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/?edit=true");
  });
});

router.get("/delete/:id", function (req, res) {
  var id = req.params.id;
  global.db.deleteOne(id, (err, r) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/?delete=true");
  });
});

module.exports = router;
