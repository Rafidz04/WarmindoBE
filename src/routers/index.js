const express = require("express");
const Router = express.Router();


//Warmindo
const UserWarmindo = require("./UserWarmindo");
const StokWarmindo = require("./StokWarmindo")
const OrderWarmindo = require("./OrderWarmindo")

const { jwtAuthenticate } = require("../middlewares/auth");
const cryptoJs = require("crypto-js");



//Warmindo Link
Router.use("/userWarmindo",UserWarmindo)
Router.use("/stokWarmindo",StokWarmindo)
Router.use("/orderWarmindo",OrderWarmindo)

Router.get("/", (req, res) => {
  res.send("server nyala");
});

module.exports = Router;
