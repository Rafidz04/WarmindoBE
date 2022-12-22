const Router = require("express").Router();
const RuanganController = require("../controllers/Ruangan");
const TrainingController = require("../controllers/Training");

Router.get("/getruanganall", RuanganController.getRuangan);
Router.get("/laporankunjungan", RuanganController.getLaporanKunjunganAll);
Router.get("/gantistatuscheckout", TrainingController.updateStatusCheckout);
// Router.get("/getNullKunjungan", TrainingController.getAllDataKunjunganNull);
module.exports = Router;
