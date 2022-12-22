const Axios = require("axios");
const StokWarmindo = require("../models/StokWarmindo");

class Controller {
  static daftarStokWarmindo(req, res, next) {
    let { namaBarang, harga, kategori } = req.body;
    StokWarmindo.create({ namaBarang, harga, kategori })
      .then((response) => {
        res.status(200).json({ message: "Stok berhasil didaftarkan" });
      })
      .catch(next);
  }
  static getStokWarmindo(req, res, next) {
    StokWarmindo.find({})
      .then((response) => {
        res.status(200).json({ data: response });
      })
      .catch(next);
  }
  static deleteStokWarmindo(req, res, next) {
    let { _id } = req.body;

    if (_id == "") {
      throw {
        message: "Maaf ID tidak boleh kosong",
      };
    } else {
      StokWarmindo.findOne({ _id })
        .then((response) => {
          if (response == null) {
            throw {
              message: "Maaf Stok tidak ada",
            };
          } else {
            return StokWarmindo.deleteOne({ _id });
          }
        })
        .then((response) => {
          res.status(200).json({
            status: 200,
            message: "Stok berhasil didelete!",
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
