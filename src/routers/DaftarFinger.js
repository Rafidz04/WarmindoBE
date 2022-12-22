const Router = require("express").Router();
const DaftarFingerController = require("../controllers/DaftarFinger");

Router.post("/daftarFinger", DaftarFingerController.daftarFinger);

module.exports = Router;
