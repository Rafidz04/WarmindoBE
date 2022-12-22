const Router = require("express").Router();
const CS = require("../controllers/ConsumableSupply");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.use(jwtAuthenticate);

Router.post("/additem", CS.addItem);
Router.patch("/addstock", CS.addStock);
Router.post("/orderItem", CS.lakukanOrder);
Router.get("/getOrder", CS.getOrders);
Router.get("/getOrderById", CS.getOrdersById);
Router.get("/getitems", CS.getItems);
Router.post("/addkategory", CS.addKategory);
Router.get("/getkategory", CS.getKategory);
Router.get("/getgrafik", CS.getGrafik);
Router.patch("/updateTotalHarga", CS.updateTotalHarga);

Router.patch("/updateOrder", CS.updateOrder);
Router.post("/importexcelstock", CS.importExcelStock);
Router.get("/getOrderItem", CS.getOrderItem);
Router.get("/getstockgudang", CS.getStockGudang);
Router.post("/addstockgudang", CS.addStockGudang);
Router.post("/orderItemGudang", CS.lakukanOrderGudang);
Router.get("/getOrderGudang", CS.getOrdersGudang);
Router.patch("/updateOrderGudang", CS.updateOrderGudang);
Router.get("/getstockgudanglt", CS.getStockGudangLt);
Router.get("/getBiaya", CS.getBiaya);
Router.get("/getOrderDownload", CS.getOrdersDownload);
Router.get("/getOrderDownloadExcel", CS.getOrdersDownloadExcel);
Router.get("/downloadstockgudang", CS.downloadStockGudang);
Router.get("/downloadordergudang", CS.downloadOrderGudang);

Router.patch("/updateStatusBarang", CS.updateStatusBarang);
Router.patch("/updateStockGudang", CS.updateStockGudang);

module.exports = Router;
