const Router = require("express").Router();
const LaporanKebersihanController = require("../controllers/LaporanKebersihan");
const { upload } = require("../middlewares/uploadImage");
Router.post(
  "/laporkanmonitoring",
  upload.array("dokumentasiAwalArr", 10),
  LaporanKebersihanController.laporkanMonitoring
);
Router.post(
  "/laporkanmonitoringtanpamasalah",
  LaporanKebersihanController.laporkanMonitoringTanpaMasalah
);
Router.post(
  "/verifyproblem",
  upload.array("dokumentasiAkhirArr", 10),
  LaporanKebersihanController.verifyProblem
);
Router.get(
  "/pelaporankebersihan",
  LaporanKebersihanController.pelaporanKebersihan
);
Router.get(
  "/getgrafikkunjungan",
  LaporanKebersihanController.getgrafikkunjungan
);
Router.get("/getexportbandu", LaporanKebersihanController.getexportbandu);
Router.get("/getrekaplaporan", LaporanKebersihanController.getrekaplaporan);
Router.get("/gethistoryproblemkeluhan", LaporanKebersihanController.getHistory);

Router.get("/rekapproblem", LaporanKebersihanController.getRekapProblem);
Router.get(
  "/gethistorikunjungangedung",
  LaporanKebersihanController.getHistoriKunjunganGedung
);
Router.delete(
  "/deletlaporan",
  LaporanKebersihanController.deletedLaporanKunjungan
);
Router.post(
  "/kirimketerangankunjungan",
  LaporanKebersihanController.kirimKeteranganKunjungan
);

module.exports = Router;
