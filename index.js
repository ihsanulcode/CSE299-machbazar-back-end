const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------fake data------------------------------------
const categories = require("./fakeData/categories.json");
const { json } = require("express");
// -----------------------------------------------------------------------------------

const uri =
  "mongodb+srv://admin:HVVHyPbqRH6OzqXT@cluster0.d2eczx7.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// --------------------------------------------------------------------------------------------

client.connect((err) => {
  console.log("MongoDB Connected Successfully");
  // perform actions on the collection object

  // machbazar mongodb database integration
  const customerCollection = client.db("machbazar").collection("users");
  const categoryCollection = client.db("machbazar").collection("categories");
  const productCollection = client.db("machbazar").collection("products");
  const productWishlistCollection = client
    .db("machbazar")
    .collection("wishlist");
  const orderCollection = client.db("machbazar").collection("orders");
  const cartCollection = client.db("machbazar").collection("cartItems");

  //----- USER API ROUTES -----//

  // USER REGISTRATION
  app.post("/register", async (req, res) => {
    const user = req.body;
    console.log(user);
    console.log("Created user");
    const result = await customerCollection.insertOne(user);
    res.send(result);
  });

  // UPDATING USER
  app.put("/user/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const user = req.body;
    const option = { upsert: "true" };
    const updatedUser = {
      $set: {
        address: user.address,
      },
    };
    console.log(user);
    const result = await customerCollection.updateOne(
      filter,
      updatedUser,
      option
    );
    res.send(result);
  });

  // GET ALL USERS
  app.get("/users", (req, res) => {
    customerCollection.find().toArray((err, data) => {
      res.send(data);
    });
  });

  // GET A USERS
  app.get("/user/:id", async (req, res) => {
    const id = req.params.id;
    const query = { uid: id };
    const user = await customerCollection.findOne(query);
    res.send(user);
  });

  // REMOVE A USERS
  app.delete("/deleteUser/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    customerCollection
      .findOneAndDelete({ _id: id })
      .then((document) => res.send(document.value));
  });

  //----- CATEGORY API ROUTES -----//

  // ADD A CATEGORY
  app.post("/category/add", (req, res) => {
    const newCategory = req.body;
    categoryCollection.insertOne(newCategory).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // GET ALL CATEGORIES
  app.get("/category/all", (req, res) => {
    categoryCollection.find().toArray((err, data) => {
      res.send(data);
    });
  });

  // GET A CATEGORY
  app.get("/category/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    categoryCollection.find({ _id: id }).toArray((err, data) => {
      res.send(data);
    });
  });

  // DELETE A CATEGORY
  app.delete("/category/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    categoryCollection
      .findOneAndDelete({ _id: id })
      .then((document) => res.send(document.value));
  });

  //----- PRODUCT API ROUTES -----//

  // ADD A PRODUCT
  app.post("/product/add", (req, res) => {
    const newProduct = req.body;
    productCollection.insertOne(newProduct).then((result) => {
      console.log(newProduct);
      console.log("Added new product");
      res.send(result.insertedCount > 0);
    });
  });

  // GET ALL PRODUCTS
  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, data) => {
      res.send(data);
    });
  });

  // GET ALL PRODUCTS OF A PARTICULAR SELLER FOR SELLER HOME
  app.get("/products/:sellerId", async (req, res) => {
    const sId = req.params.sellerId;
    const query = { sellerId: sId };
    const cursor = productCollection.find(query);
    const sellerProducts = await cursor.toArray();
    res.send(sellerProducts);
  });

  // GET ALL PRODUCTS ACCORDING TO A CATEGORY
  app.get("/products/category/:catName", async (req, res) => {
    const catName = req.params.catName;
    const query = { category: catName };
    const cursor = productCollection.find(query);
    const searchProducts = await cursor.toArray();
    console.log(searchProducts);
    res.send(searchProducts);
  });

  // GET A PRODUCT
  app.get("/product/:id", async (req, res) => {
    const id = req.params.id;
    const fish = await productCollection.findOne({ _id: ObjectId(id) });
    res.send(fish);
  });

  // DELETE A PRODUCT
  app.delete("/deleteProduct/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productCollection.deleteOne(query);
    res.send(result);
  });

  //----- WISHLIST API ROUTES -----//

  // ADD A PRODUCT TO WISHLIST
  app.post("/wishlist/add", (req, res) => {
    const newProduct = req.body;
    productWishlistCollection.insertOne(newProduct).then((result) => {
      console.log(result);
      res.send(result);
    });
  });

  // GET PRODUCT WISHLIST BY USER
  app.get("/wishlist/:uid", (req, res) => {
    const id = req.params.uid;
    productWishlistCollection.find({ user: id }).toArray((err, data) => {
      res.send(data);
    });
  });

  // DELETE A PRODUCT FROM WISHLIST
  app.delete("/deleteWishlistedProduct/:id", async (req, res) => {
    const id = req.params.id;
    const result = await productWishlistCollection.deleteOne({
      _id: ObjectId(id),
    });
    console.log(result);
    console.log("Deleted wish item");
    res.send(result);
  });

  //----- ORDER API ROUTES -----//

  // ADD AN ORDER
  app.post("/order/add", (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result);
    });
  });

  // GET ALL ORDERS
  app.get("/orders", (req, res) => {
    orderCollection.find().toArray((err, data) => {
      res.send(data);
    });
  });

  // GET ORDERS FOR USER
  app.get("/order/:uid", (req, res) => {
    const uid = req.params.uid;
    orderCollection.find({ user: uid }).toArray((err, data) => {
      res.send(data);
    });
  });

  // GET ORDERS OF SELLER
  app.get("/seller/order/:uid", (req, res) => {
    const uid = req.params.uid;
    orderCollection.find({ sellerId: uid }).toArray((err, data) => {
      res.send(data);
    });
  });

  // UPDATE AN ORDER STATUS BY ID
  app.put("/updateOrder/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const item = req.body;
    const option = { upsert: "true" };
    const updatedOrder = {
      $set: {
        orderStatus: item.orderStatus,
      },
    };
    const result = await orderCollection.updateOne(
      filter,
      updatedOrder,
      option
    );
    res.send(result);
  });

  // DELETE AN ORDER BY ID
  app.delete("/deleteOrder/:id", async (req, res) => {
    const id = req.params.id;
    const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
    console.log(result);
    console.log("Deleted order");
    res.send(result);
  });

  // -----------CART API------------------

  // getting data from client and sending it to data base
  app.post("/addCartItem", async (req, res) => {
    const cartItem = req.body;
    console.log(cartItem);
    console.log("Added new cart to db");
    const result = await cartCollection.insertOne(cartItem);
    res.send(result);
  });

  // getting cart data from db and sending it to client side
  app.get("/cart/:uid", async (req, res) => {
    const uid = req.params.uid;
    const query = { user: uid };
    const cursor = cartCollection.find(query);
    const cartItems = await cursor.toArray();
    console.log(cartItems);
    console.log("Get cart from db");
    res.send(cartItems);
  });

  // deleting CARTiTEM from database
  app.delete("/deleteItem/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await cartCollection.deleteOne(query);
    console.log(result);
    console.log("Deleted cart from db");
    res.send(result);
  });

  // delete cart
  app.delete("/deleteCart/:uid", async (req, res) => {
    const uid = req.params.uid;
    const query = { user: uid };
    const result = await cartCollection.deleteMany(query);
    console.log(result);
    console.log("Deleted cart from db");
    res.send(result);
  });

  // updating cart quantity and price
  app.put("/updateCart/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const item = req.body;
    const option = { upsert: "true" };
    const updatedCart = {
      $set: {
        price: item.price,
        weight: item.weight,
      },
    };
    const result = await cartCollection.updateOne(filter, updatedCart, option);
    res.send(result);
  });

  // ------------------------------------------------------------------------------------------------------

  app.get("/", (req, res) => {
    res.send("machbazar server is running here");
  });

  // The categories on the left side nav
  app.get("/categories", (req, res) => {
    res.send(categories);
  });

  // All the fish cards in home page coming from fish cards
  app.get("/fishCards", (req, res) => {
    res.send(fishCards);
  });
});

app.listen(port, () => {
  console.log("MACHBAZAR");
});
