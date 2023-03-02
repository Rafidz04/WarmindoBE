const Axios = require("axios");
const StokWarmindo = require("../models/StokWarmindo");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Controller {
  static daftarStokWarmindo(req, res, next) {
    let { kodeBarang, namaBarang, harga, kategori, totalStock, minimStock } =
      req.body;

    StokWarmindo.find({ kodeBarang: kodeBarang })
      .then((respon) => {
        if (respon.length === 0) {
          return StokWarmindo.create({
            kodeBarang,
            namaBarang,
            harga,
            minimStock,
            kategori,
            totalStock,
            fotoProduk: req.body.foto,
          });
        } else {
          return StokWarmindo.updateOne(
            { kodeBarang: kodeBarang },
            { $inc: { totalStock: +totalStock } }
          );
        }
      })

      .then((response) => {
        res.status(200).json({ message: "Stok berhasil didaftarkan" });
      })
      .catch(next);
  }
  static getStokWarmindo(req, res, next) {
    let kategori = req.query;
    if (!kategori.kategori) {
      StokWarmindo.find({})
        .sort({ kodeBarang: 1 })
        .then((response) => {
          let makanan = [];
          let minuman = [];
          let toping = [];
          response.map((val) => {
            if (val.kategori === "makanan") {
              makanan.push(val);
            } else if (val.kategori === "minuman") {
              minuman.push(val);
            } else {
              toping.push(val);
            }
          });

          let listMakananTerakhir = makanan[makanan.length - 1];
          let listMinumanTerakhir = minuman[minuman.length - 1];
          let listTopingTerakhir = toping[toping.length - 1];
          res.status(200).json({
            data: response,
            listMakananAkhir: listMakananTerakhir,
            listMinumanAkhir: listMinumanTerakhir,
            listTopingAkhir: listTopingTerakhir,
          });
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
    let { idStock, totalStock, harga, status, minimStock } = req.body;

    StokWarmindo.findByIdAndUpdate(idStock, {
      totalStock: totalStock,
      harga: harga,
      status: status,
      minimStock: minimStock,
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
          return StokWarmindo.deleteOne({ _id: ObjectId(_id) });
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

  static getHarusOrder(req, res, next) {
    StokWarmindo.find({})
      .then((response) => {
        let tmp = [];
        response.map((val) => {
          if (val.totalStock <= val.minimStock) {
            tmp.push(val);
          }
        });
        res.status(200).json(tmp);
      })
      .catch(next);
  }
}

module.exports = Controller;
