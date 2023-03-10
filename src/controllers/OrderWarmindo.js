const Axios = require("axios");
const OrderWarmindo = require("../models/OrderWarmindo");
const ListOrderWarmindo = require("../models/ListOrderWarmindo");
const StockWarmindo = require("../models/StokWarmindo");
const moment = require("moment");

class Controller {
  static addOrderWarmindo(req, res, next) {
    let namaKasir = req.decoded.nama;
    let orderArr = JSON.parse(req.body.orderArr);
    let { namaPelanggan } = req.body;

    OrderWarmindo.create({ namaPelanggan: namaPelanggan, namaKasir: namaKasir })
      .then((response) => {
        orderArr.map((val) => {
          return StockWarmindo.updateOne(
            { _id: val.idStock },
            { $inc: { totalStock: -1 * Number(val.kuantitas) } }
          ).then((respon) => {
            return ListOrderWarmindo.create({
              idOrder: response._id,
              // idStock: val.idStock,
              namaBarang: val.namaBarang,
              hargaBarang: val.hargaBarang,
              kategori: val.kategori,
              kuantitas: val.kuantitas,
              totalKuantitas: val.totalKuantitas,
            });
          });
        });
      })
      .then((respon) => {
        res.status(200).json({ status: 200, message: "Anda berhasil order" });
      })
      .catch(next);
  }
  static getOrderWarmindo(req, res, next) {
    OrderWarmindo.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "listorderwarmindos",
          let: {
            idOrder: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$idOrder", "$$idOrder"] }],
                },
              },
            },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        res.status(200).json({ status: 200, data: respon });
      })
      .catch(next);
  }

  static getAllOrderWarmindo(req, res, next) {
    ListOrderWarmindo.find({})
      .then((respon) => {
        res.status(200).json({ status: 200, data: respon });
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
  }

  static getGrafikPenghasilanWarmindo(req, res, next) {
    let year = req.query;

    var firstdate = new Date(year.year, 0, 1).getTime();
    var lastdate = new Date(year.year, 11, 31).getTime();

    let tglMulai = new Date(Number(firstdate));
    let tglSelesai = new Date(Number(lastdate));

    ListOrderWarmindo.find({
      $and: [
        { createdAt: { $lt: tglSelesai } },
        { createdAt: { $gt: tglMulai } },
      ],
    })
      .then((response) => {
        let jan = 0;
        let feb = 0;
        let mar = 0;
        let apr = 0;
        let mei = 0;
        let jun = 0;
        let jul = 0;
        let ags = 0;
        let spt = 0;
        let okt = 0;
        let nov = 0;
        let des = 0;
        let total = 0;

        response.map((val) => {
          let bulan = new Date(val.createdAt).getMonth();
          if (bulan + 1 === 1) {
            jan += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 2) {
            feb += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 3) {
            mar += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 4) {
            apr += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 5) {
            mei += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 6) {
            jun += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 7) {
            jul += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 8) {
            ags += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 9) {
            spt += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 10) {
            okt += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 11) {
            nov += val.totalKuantitas;
            total += val.totalKuantitas;
          } else if (bulan + 1 === 12) {
            des += val.totalKuantitas;
            total += val.totalKuantitas;
          }
        });

        let tmpAllMonth = [
          jan,
          feb,
          mar,
          apr,
          mei,
          jun,
          jul,
          ags,
          spt,
          okt,
          nov,
          des,
        ];

        res.status(200).json({ status: 200, data: tmpAllMonth, total: total });
      })
      .catch(next);
  }

  static getGrafikPelanggan(req, res, next) {
    let year = req.query;

    var firstdate = new Date(year.year, 0, 1).getTime();
    var lastdate = new Date(year.year, 11, 31).getTime();

    let tglMulai = new Date(Number(firstdate));
    let tglSelesai = new Date(Number(lastdate));

    OrderWarmindo.find({
      $and: [
        { createdAt: { $lt: tglSelesai } },
        { createdAt: { $gt: tglMulai } },
      ],
    })
      .then((response) => {
        let jan = 0;
        let feb = 0;
        let mar = 0;
        let apr = 0;
        let mei = 0;
        let jun = 0;
        let jul = 0;
        let ags = 0;
        let spt = 0;
        let okt = 0;
        let nov = 0;
        let des = 0;
        let total = 0;

        response.map((val) => {
          let bulan = new Date(val.createdAt).getMonth();
          if (bulan + 1 === 1) {
            jan++;
            total++;
          } else if (bulan + 1 === 2) {
            feb++;
            total++;
          } else if (bulan + 1 === 3) {
            mar++;
            total++;
          } else if (bulan + 1 === 4) {
            apr++;
            total++;
          } else if (bulan + 1 === 5) {
            mei++;
            total++;
          } else if (bulan + 1 === 6) {
            jun++;
            total++;
          } else if (bulan + 1 === 7) {
            jul++;
            total++;
          } else if (bulan + 1 === 8) {
            ags++;
            total++;
          } else if (bulan + 1 === 9) {
            spt++;
            total++;
          } else if (bulan + 1 === 10) {
            okt++;
            total++;
          } else if (bulan + 1 === 11) {
            nov++;
            total++;
          } else if (bulan + 1 === 12) {
            des++;
            total++;
          }
        });

        let tmpAllMonth = [
          jan,
          feb,
          mar,
          apr,
          mei,
          jun,
          jul,
          ags,
          spt,
          okt,
          nov,
          des,
        ];

        res.status(200).json({ status: 200, data: tmpAllMonth, total: total });
      })
      .catch(next);
  }

  static getHistoryOrderHariIni(req, res, next) {
    let { date } = req.query;
    let fromDate = new Date(Number(date));
    fromDate.setHours(0, 0, 0, 0);
    let toDate = new Date(Number(date));
    toDate.setHours(23, 59, 59, 59);
    OrderWarmindo.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lt: toDate },
        },
      },
      {
        $lookup: {
          from: "listorderwarmindos",
          let: {
            idOrder: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$idOrder", "$$idOrder"] }],
                },
              },
            },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        res.status(200).json({ status: 200, data: respon });
      })
      .catch(next);
  }
}

module.exports = Controller;
