const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const It = require("../controllers/ItProject");

Router.post("/ajukanit", It.ajukanProjectIT);
Router.patch("/responit", upload.array("buktiSelesai", 10), It.responProjectIT);
Router.patch("/ajukanitulang", It.ajukanProjectITUlang);
Router.get("/getitall", It.getProjectITAll);
Router.get("/getitbystatus", It.getProjectITByStatus);
Router.get("/getitgrafik", It.getItGrafik);
module.exports = Router;
