const Router = require("express").Router();
const RuanganController = require("../controllers/Ruangan");

Router.post("/daftargedung", RuanganController.daftarGedung);
Router.post("/daftarruangan", RuanganController.daftarRuangan);
Router.get("/getcategoryarea", RuanganController.getCategoryArea);
Router.get("/getareaall", RuanganController.getCategoryAreaAll);
Router.get("/getpdfruangan", RuanganController.getpdfruangan);
Router.get("/getqrruangan", RuanganController.getqrruangan);
Router.get("/getareabykoderuangan", RuanganController.getAreaByKodeRuangan);
Router.get("/getgedungsproblem", RuanganController.getGedungsProblem);
Router.get("/getgedungskeluhan", RuanganController.getGedungsKeluhan);
Router.patch("/editkoderuangan", RuanganController.editKodeRuangan);
Router.delete("/deletearea", RuanganController.deleteArea);
Router.delete("/deletegedung", RuanganController.deleteGedung);
module.exports = Router;
