const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const TrainingController = require("../controllers/Training");
const cors = require("cors");

Router.post("/ajukantraining", TrainingController.ajukanTraining);
Router.patch(
  "/respontraining",
  upload.array("buktiSelesai", 10),
  TrainingController.responTraining
);
Router.patch("/ajukantrainingulang", TrainingController.ajukanTrainingUlang);
Router.get("/gettrainingall", TrainingController.getTrainingAll);
Router.get("/gettrainingbystatus", TrainingController.getTrainingByStatus);
Router.get("/getgrafiktraining", TrainingController.getGrafikTraining);
Router.get("/gettrainingcalendar", TrainingController.getTrainingCalendar);
Router.post(
  "/importexcelabsensi",
  cors(),
  TrainingController.importExcelAbsensi
);
Router.get("/getabsensiall", TrainingController.getAbsensiAll);
Router.get("/exportabsenbydate", TrainingController.exportAbsensibyDate);
Router.get("/getgrafikabsensi", TrainingController.getGrafikAbsensi);
Router.delete("/deletetraining", TrainingController.deleteTraining);

Router.get("/getallevent", TrainingController.getAllEvent);
Router.get("/getalleventcalendar", TrainingController.getAllEventCalendar);
Router.post("/setjumlahkaryawan", TrainingController.setJumlahKaryawanMasuk);
Router.get("/getjumlahkaryawan", TrainingController.getJumlahKaryawanMasuk);
module.exports = Router;
