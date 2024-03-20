const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./productRoutes");
const registerRoutes = require("./registerRoutes");
const { router: authRoutes, verifyToken } = require("./authRoutes");

const app = express();
app.use(bodyParser.json());

const port = 3000;

app.use("/products", verifyToken, productRoutes);
app.use("/register", registerRoutes);
app.use("/login", authRoutes);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
