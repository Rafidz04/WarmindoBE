const Router = require("express").Router();
const ShiftController = require("../controllers/Shift");

Router.post("/daftarShift", ShiftController.daftarShift);
Router.patch("/assignshifttoroom", ShiftController.assignShiftToRoom);
Router.get("/getshiftall", ShiftController.getShift);
Router.delete("/deleteshift", ShiftController.deleteShift);
Router.post("/addevent", ShiftController.addJadwalLibur);
Router.get("/getevent", ShiftController.getJadwalLibur);
Router.delete("/deletejadwallibur", ShiftController.deleteJadwalLibur);
module.exports = Router;
