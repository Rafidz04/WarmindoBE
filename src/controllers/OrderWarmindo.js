const Axios = require("axios");
const OrderWarmindo = require("../models/OrderWarmindo");

class Controller {
  static addOrderWarmindo(req, res, next) {
    let { idStock, namaPelanggan, kuantitas, totalKuantitas } = req.body;
    OrderWarmindo.create({ idStock, namaPelanggan, kuantitas, totalKuantitas })
    .then((response) => {
        res.status(200).json({ message: "Order berhasil didaftarkan" });
      })
      .catch(next);
  }
  static getOrderWarmindo(req, res, next) {
    OrderWarmindo.find({})
      .then((response) => {
        res.status(200).json({ data: response });
      })
      .catch(next);
  }
  static deleteOrderWarmindo(req, res, next) {
    let { _id } = req.body;

    if (_id == "") {
      throw {
        message: "Maaf ID tidak boleh kosong",
      };
    } else {
      OrderWarmindo.findOne({ _id })
        .then((response) => {
          if (response == null) {
            throw {
              message: "Maaf Order tidak ada",
            };
          } else {
            return OrderWarmindo.deleteOne({ _id });
          }
        })
        .then((response) => {
          res.status(200).json({
            status: 200,
            message: "Order berhasil didelete!",
          });
        })
        .catch(next);
    }

    // StokWarmindo.findByIdAndDelete({ _id })
    //   .then((response) => {
    //     res.status(200).json({
    //       status: 200,
    //       data :response,
    //       message: "Stok berhasil didelete!",
    //     });
    //   })
    //   .catch(next);
  }
}

module.exports = Controller;
