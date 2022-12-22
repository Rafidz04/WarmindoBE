const express = require("express");
const Router = express.Router();
const User = require("./User");
const LaporanKebersihan = require("./LaporanKebersihan");
const ruangan = require("./Ruangan");
const keluhan = require("./Keluhan");
const shift = require("./Shift");
const project = require("./Project");
const Kuisioner = require("./Kuisioner");
const Proposal = require("./Proposal");
const Pembinaan = require("./Pembinaan");
const Training = require("./Training");
const KunjunganPest = require("./KunjunganPestRodent");
const TemuanPest = require("./TemuanPestRodent");
const Safety = require("./Safety");
const VisitIndustrialIssue = require("./VisitIndustrialIssue");
const ResponIndustrial = require("./ResponIndustrial");
const ItProject = require("./ItProject");
const ItHardware = require("./ItHardware");
const ItSoftware = require("./ItSoftware");
const Consumable = require("./ConsumableSupply");
const DaftarFinger = require("./DaftarFinger");
const Cj = require("./Cj");

//Warmindo
const UserWarmindo = require("./UserWarmindo");
const StokWarmindo = require("./StokWarmindo")
const OrderWarmindo = require("./OrderWarmindo")

const { jwtAuthenticate } = require("../middlewares/auth");
const cryptoJs = require("crypto-js");

Router.use("/user", User);

Router.use("/laporan", jwtAuthenticate, LaporanKebersihan);
Router.use("/lokasi", jwtAuthenticate, ruangan);
Router.use("/keluhan", keluhan);
Router.use("/kuisioner", Kuisioner);
Router.use("/finger", DaftarFinger);
Router.use("/shift", jwtAuthenticate, shift);
Router.use("/project", jwtAuthenticate, project);
Router.use("/proposal", jwtAuthenticate, Proposal);
Router.use("/pembinaan", jwtAuthenticate, Pembinaan);
Router.use("/training", jwtAuthenticate, Training);
Router.use("/kunjunganpest", jwtAuthenticate, KunjunganPest);
Router.use("/temuanpest", jwtAuthenticate, TemuanPest);
Router.use("/safety", jwtAuthenticate, Safety);
Router.use("/visitindustrialissue", jwtAuthenticate, VisitIndustrialIssue);
Router.use("/responindustrial", jwtAuthenticate, ResponIndustrial);
Router.use("/itproject", jwtAuthenticate, ItProject);
Router.use("/consumable", jwtAuthenticate, Consumable);
Router.use("/ithardware", jwtAuthenticate, ItHardware);
Router.use("/itsoftware", jwtAuthenticate, ItSoftware);
Router.use("/cj", Cj);

//Warmindo Link
Router.use("/userWarmindo",UserWarmindo)
Router.use("/stokWarmindo",StokWarmindo)
Router.use("/orderWarmindo",OrderWarmindo)

Router.get("/", (req, res) => {
  res.send("server nyala");
});

module.exports = Router;
