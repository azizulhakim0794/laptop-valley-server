
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
app.use(bodyParser.json())
app.use(cors());
const port = 5000;
app.get('/', (req, res) => {
  res.send("hello from db it's working working")
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const AllLaptopCollection = client.db("laptop-valley").collection("laptops");
  const UserOrderCollection = client.db("laptop-valley").collection("userOrder");
  const AdminCollection = client.db("laptop-valley").collection("admin");
  // perform actions on the collection object
  app.post('/addProduct', (req, res) => {
    const name = req.body.name
    const price = req.body.price
    const img = req.body.img
    AllLaptopCollection.insertOne({ name: name, price: price, img: img })
      .then(result => {
        res.status(201).send(result.insertedCount > 0);
      })
  })
  app.delete("/deleteProduct", (req, res) => {
    const id = req.headers.id
    if (id) {
      AllLaptopCollection.deleteOne({ _id: ObjectId(id) })
        .then(result => {
          res.status(200).send(result.deletedCount > 1)
        })
    }
  })
  app.get('/allProducts', (req, res) => {
    AllLaptopCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  app.get('/product/:id', (req, res) => {
    // const id = req.params.id
    AllLaptopCollection.find({ _id: ObjectId(id) })
      .toArray((err, documents) => {
        res.status(200).send(documents[0])
      })
  })
  app.post('/addUserOrder', (req, res) => {
    const productName = req.body.productName
    const productQuantity = req.body.productQuantity
    const productPrice = req.body.productPrice
    const productId = req.body.productId
    const userEmail = req.body.userEmail
    UserOrderCollection.insertOne({ productName: productName, productQuantity: productQuantity, productPrice: productPrice, productId: productId, userEmail: userEmail })
      .then(result => {
        res.status(201).send(result.insertedCount > 0);
      })
  })
  app.get('/userOrder', (req, res) => {
    const email = req.headers.email
    // console.log(email)
    UserOrderCollection.find({ userEmail: email })
      .toArray((err, documents) => {
        res.status(200).send(documents)
      })
  })
  app.get('/isAdmin', (req, res) => {
    const email = req.headers.email
    // console.log(email)
    AdminCollection.find({ email: email })
      .toArray((err, documents) => {
        res.status(200).send(documents.length > 0)
      })
  })
});
app.listen(process.env.PORT || port)