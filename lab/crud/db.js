const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const assert = require("assert");

MongoClient.connect(
  process.env.MONGO_CONNECTION,
  { useUnifiedTopology: true },
  function (err, client) {
    assert.equal(null, err);
    global.conn = client.db(process.env.DATABASE_NAME);
    console.log("Connected successfully to database server");
  }
);

function findAll(callback) {
  global.conn.collection("customers").find({}).toArray(callback);
}

function insert(customer, callback) {
  global.conn.collection("customers").insert(customer, callback);
}

function findOne(id, callback) {
  global.conn.collection("customers").findOne(new ObjectId(id), callback);
}

function update(id, customer, callback) {
  global.conn
    .collection("customers")
    .update({ _id: new ObjectId(id) }, customer, callback);
}

function deleteOne(id, callback) {
  global.conn
    .collection("customers")
    .deleteOne({ _id: new ObjectId(id) }, callback);
}

module.exports = { findAll, insert, findOne, update, deleteOne };
