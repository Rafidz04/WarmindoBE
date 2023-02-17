const Axios = require("axios");
const StokWarmindo = require("../models/StokWarmindo");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Controller {
  static daftarStokWarmindo(req, res, next) {
    let { namaBarang, harga, kategori, totalStock } = req.body;

    StokWarmindo.create({
      namaBarang,
      harga,
      kategori,
      totalStock,
      fotoProduk: req.body.foto,
    })
      .then((response) => {
        res.status(200).json({ message: "Stok berhasil didaftarkan" });
      })
      .catch(next);
  }
  static getStokWarmindo(req, res, next) {
    let kategori = req.query;
    console.log(!kategori.kategori);
    if (!kategori.kategori) {
      StokWarmindo.find({})
        .then((response) => {
          res.status(200).json({ data: response });
        })
        .catch(next);
    } else {
      StokWarmindo.find({ kategori: kategori.kategori })
        .then((response) => {
          res.status(200).json({ data: response });
        })
        .catch(next);
    }
  }

  static editStokWarmindo(req, res, next) {
    let { idStock, totalStock, harga } = req.body;
    console.log(">>>>>>>")
    console.log(idStock)

    StokWarmindo.findByIdAndUpdate(idStock, {
      totalStock: totalStock,
      harga: harga,
    })
      .then((respon) => {
        res.status(200).json({ message: "Berhasil update stock!" });
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
          console.log(response,">>>>>>>>>")
         return StokWarmindo.deleteOne({ "_id" : ObjectId(_id) });
        })
        .then((response) => {
          res.status(200).json({
            status: 200,
            message: "Stok berhasil didelete!",
          });
        })
        .catch(next);
    }
  }
}

module.exports = Controller;
