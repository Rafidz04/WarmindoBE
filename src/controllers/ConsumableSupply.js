const CSStock = require("../models/CSStock");
const CSOrder = require("../models/CSOrder");
const CSOrderStock = require("../models/CSOrderStock");
const CSKategory = require("../models/CSKategory");
const CSStockGudang = require("../models/CSStockGudang");
const CSOrderStockGudang = require("../models/CSOrderStockGudang");
const CSOrderGudang = require("../models/CSOrderGudang");
const Busboy = require("busboy");
var ObjectId = require("mongodb").ObjectID;
const XLSX = require("xlsx");
const path = require("path");
const { response } = require("express");
// const fs = require("fs");
// const PDFDocument = require("pdfkit-table");
// const { jsPDF } = require("jspdf/dist/jspdf.node");
// require("jspdf-autotable");

// If you are not importing jsPDF with require('jspdf')
// you can apply the AutoTable plugin to any jsPDF with the
// applyPlugin function.
// const { applyPlugin } = require("../../dist/jspdf.plugin.autotable");
// applyPlugin(jsPDF);

class Controller {
  static addKategory(req, res, next) {
    let { nama } = req.body;
    CSKategory.create({ nama })
      .then((respon) => {
        res
          .status(200)
          .json({ message: "Kategori pesanan berhasil ditambahkan!" });
      })
      .catch(next);
  }
  static getKategory(req, res, next) {
    CSKategory.find({})
      .sort({ nama: 1 })
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }
  static addKategory(req, res, next) {
    let { nama } = req.body;
    CSKategory.create({ nama })
      .then((respon) => {
        res
          .status(200)
          .json({ message: "Kategori pesanan berhasil ditambahkan!" });
      })
      .catch(next);
  }
  static addItem(req, res, next) {
    let { kode, nama, satuan, kategori, brand, spek } = req.body;
    let newKode = kode.toUpperCase();
    CSStock.find({ kode: newKode })
      .then((respon) => {
        if (respon == "") {
          CSStock.create({ kode, nama, satuan, kategori, brand, spek })
            .then((respon) => {
              res.status(200).json({ message: "Item berhasil ditambahkan!" });
            })
            .catch(next);
        } else {
          res
            .status(201)
            .json({ message: "Maaf kode barang atau nama barang sudah ada!" });
          // throw {
          //   message: "Maaf kode barang atau nama barang sudah ada!",
          //   status: 400,
          // };
        }
      })
      .catch(next);
    // CSStock.create({ kode, nama, satuan, kategori, brand, spek })
    //   .then((respon) => {
    //     res.status(200).json({ message: "Item berhasil ditambahkan!" });
    //   })
    //   .catch(next);
  }

  static addStock(req, res, next) {
    let { id, stock } = req.body;

    CSStock.findById(id)
      .then((respon) => {
        if (!respon) {
          throw { message: "Maaf item tidak ditemukan", status: 400 };
        } else {
          // console.log(respon);
          respon.stock += Number(stock);
          return respon.save();
        }
      })
      .then((respon) => {
        res.status(200).json({ message: "Stock berhasil ditambahkan!" });
      })
      .catch(next);
  }

  static lakukanOrder(req, res, next) {
    let { items } = req.body;
    let { nama, cabang, perusahaan } = req.decoded;
    let newItems = JSON.parse(items);
    let dateOrder = new Date();
    let deadLineDate = new Date().setHours(dateOrder.getHours() + 720);
    CSOrder.create({
      nama,
      kode:
        "BAP-" +
        dateOrder.getDate().toString() +
        (dateOrder.getMonth() + 1).toString() +
        dateOrder.getFullYear().toString() +
        dateOrder.getHours().toString() +
        dateOrder.getMinutes().toString() +
        dateOrder.getSeconds().toString(),
      // kategori,
      history: [{ status: "Progress", date: new Date() }],
      deadlineDate: dateOrder.setHours(dateOrder.getHours() + 720),
    })
      .then((respon) => {
        let tmp = newItems.map((val) => {
          return {
            idStock: val.idItem,
            idOrder: respon._id,
            hargaSatuan: val.harga,
            Qty: val.qty,
            totalHarga: val.totalHarga,
            deadlineDate: deadLineDate,
          };
        });

        return CSOrderStock.create(tmp);
      })
      .then((respon) => {
        let tmp = newItems.map((val) => {
          return CSStock.findById(val.idItem)
            .then((respon) => {
              CSStockGudang.findOneAndUpdate(
                { kode: respon.kode },
                { status: "Process" }
              )
                .then((data) => {})
                .catch(next);
            })
            .catch(next);
        });
      })
      // .then((respon) => {
      //   let tmp = newItems.map((val) => {
      //     return CSStock.updateOne(
      //       { _id: val.idItem },
      //       { $inc: { stock: -1 * Number(val.qty) } }
      //     );
      //   });

      //   return Promise.all(tmp);
      // })
      .then((respon) => {
        res.status(200).json({ message: "Pemesanan berhasil dilakukan!" });
      })
      .catch(next);
  }

  static getOrders(req, res, next) {
    CSOrder.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csorderstocks",
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
            {
              $lookup: {
                from: "csstocks",
                let: {
                  idStock: "$idStock",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStock"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }
  static getItems(req, res, next) {
    CSStock.find({})
      .sort({ nama: 1 })
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }

  static updateOrder(req, res, next) {
    let { idOrder, status, items } = req.body;

    if (status === "Delivery") {
      CSOrder.findById(idOrder)
        .then((respon) => {
          if (respon) {
            if (respon.status === "Progress") {
              respon.history = [
                { status: "Delivery Process", date: new Date() },
                ...respon.history,
              ];
              respon.status = "Delivery Process";
              return respon.save();
            } else {
              throw { message: "Maaf, sudah dalam pengiriman!", status: 400 };
            }
          } else {
            throw { message: "Maaf, order tidak ditemukan!", status: 400 };
          }
        })
        .then((respon) => {
          let newItems = JSON.parse(items);
          let tmp = newItems.map((val) => {
            CSOrderStock.findByIdAndUpdate(val.idItem, {
              hargaSatuan: val.hargaSatuan,
              totalHarga: val.totalHarga,
            })
              .then((respon) => {})
              .catch(next);
          });

          return tmp;
        })
        .then((respon) => {
          res
            .status(200)
            .json({ message: "Status pemesanan berhasil diupdate!" });
        })
        .catch(next);
    } else if (status === "Done") {
      CSOrder.findById(idOrder)
        .then((respon) => {
          if (respon && respon.status === "Delivery Process") {
            let date = new Date();
            respon.history = [
              { status: "Received", date: date },
              ...respon.history,
            ];
            respon.status = "Received";
            respon.arrivedDate = date;
            let dateLama = new Date(respon.deadlineDate);
            var diff = (date - dateLama) / 7200000;
            respon.solvedInTime = diff <= 24 ? true : false;
            return respon.save();
          } else if (respon && respon.status !== "Delivery Process") {
            throw { message: "Maaf, order belum dikirim!", status: 400 };
          } else {
            throw { message: "Maaf, order tidak ditemukan!", status: 400 };
          }
        })
        .then((respon) => {
          res
            .status(200)
            .json({ message: "Status pemesanan berhasil diupdate!" });
          CSOrderStock.aggregate([
            {
              $match: { idOrder: ObjectId(idOrder) },
            },
            {
              $lookup: {
                from: "csstocks",
                localField: "idStock",
                foreignField: "_id",
                as: "items",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$items", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { items: 0 } },
            {
              $sort: { createdAt: -1 },
            },
          ])
            .then((respon) => {
              let tmp = respon.map((val) => {
                return CSStockGudang.find({ kode: val.kode }).then((res) => {
                  if (res == "") {
                    CSStockGudang.create({
                      idStock: val.idStock,
                      kode: val.kode,
                      nama: val.nama,
                      satuan: val.satuan,
                      stock: val.Qty,
                      kategori: val.kategori,
                      brand: val.brand,
                      spek: val.spek,
                      minStock: val.Qty,
                    });
                  } else {
                    return CSStockGudang.updateMany(
                      { kode: res[0].kode },
                      // { status: "Full" },
                      { $inc: { stock: val.Qty }, status: "Full" }
                    );
                  }
                });
              });
              return Promise.all(tmp);
            })
            .catch(next);
        })
        .catch(next);
    }
  }

  static updateTotalHarga(req, res, next) {
    let { idItem, hargaSatuan, totalHarga } = req.body;

    CSOrderStock.findByIdAndUpdate(idItem, {
      hargaSatuan: hargaSatuan,
      totalHarga: totalHarga,
    })
      .then((respon) => {
        res.status(200).json({ message: "Harga berhasil diupdate!" });
      })
      .catch(next);
  }

  static getGrafik(req, res, next) {
    let { dari, sampai } = req.query;
    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    let Kategori;
    let dateNow = new Date();
    let bulan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    CSOrderStock.aggregate([
      {
        $match: {
          createdAt: { $gt: tglMulai, $lt: tglSelesai },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          items: {
            $push: "$$ROOT",
          },
        },
      },
    ])
      .then((respon) => {
        let tmp = [];
        let Output = [
          {
            name: "Consumable",
            Progress: 0,
            Delivery: 0,
            Received: 0,
            OnTime: 0,
            "Not OnTime": 0,
          },
        ];
        let ave = [];
        let totalAve = 0;

        respon.forEach((val, index) => {
          bulan.forEach((valMon, indexMon) => {
            if (indexMon == new Date(val.items[0].createdAt).getMonth()) {
              tmp.push({
                name: valMon,
                Progress: 0,
                Delivery: 0,
                Received: 0,
                OnTime: 0,
                "Not OnTime": 0,
                Total: 0,
              });
            }
          });

          val.items.forEach((value, index1) => {
            tmp[index]["Total"]++;
            if (value.statusBarang == "Progress") {
              tmp[index]["Progress"]++;
              if (dateNow <= new Date(value.deadlineDate)) {
                tmp[index]["OnTime"]++;
              } else {
                tmp[index]["Not OnTime"]++;
              }
            } else if (value.statusBarang == "Delivery Process") {
              tmp[index]["Delivery"]++;
              if (dateNow <= new Date(value.deadlineDate)) {
                tmp[index]["OnTime"]++;
              } else {
                tmp[index]["Not OnTime"]++;
              }
            } else if (value.statusBarang == "Received") {
              tmp[index]["Received"]++;
              if (value.solvedInTime) {
                tmp[index]["OnTime"]++;
              } else {
                tmp[index]["Not OnTime"]++;
              }
            }
          });
        });
        tmp.forEach((val, index) => {
          Output[0]["Progress"] += val.Progress;
          Output[0]["Delivery"] += val.Delivery;
          Output[0]["Received"] += val.Received;
          Output[0]["OnTime"] += val.OnTime;
          Output[0]["Not OnTime"] += val["Not OnTime"];
          ave.push(Math.round(val.OnTime / val.Total) * 100);
        });

        ave.forEach((val) => {
          return (totalAve += val);
        });

        // console.log(totalAve);
        res.status(200).json({
          record: tmp,
          data: Output,
          pencapaian: respon.length ? Math.ceil(totalAve / ave.length) : "-",
          target: 100,
        });
        // res.status(200).json(tmp);
      })
      .catch(next);
    // CSOrderStock.find({
    //   createdAt: { $gt: tglMulai, $lt: tglSelesai },
    // })
    //   .then((respon) => {
    //     let Output = [
    //       {
    //         name: "Consumable",
    //         Progress: 0,
    //         Delivery: 0,
    //         Received: 0,
    //         OnTime: 0,
    //         "Not OnTime": 0,
    //       },
    //     ];
    //     respon.forEach((val) => {
    //       if (val.statusBarang == "Progress") {
    //         Output[0]["Progress"]++;
    //         if (dateNow <= new Date(val.deadlineDate)) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       } else if (val.statusBarang == "Delivery Process") {
    //         Output[0]["Delivery"]++;
    //         if (dateNow <= new Date(val.deadlineDate)) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       } else if (val.statusBarang == "Received") {
    //         Output[0]["Received"]++;
    //         if (val.solvedInTime) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       }
    //     });
    //     let pencapaian = (Output[0]["OnTime"] / respon.length) * 100;
    //     res.status(200).json({
    //       data: Output,
    //       pencapaian: respon.length ? Math.ceil(pencapaian) : 100,
    //       target: 100,
    //     });
    //   })
    //   .catch(next);
    // CSOrder.find({
    //   createdAt: { $gt: tglMulai, $lt: tglSelesai },
    // })
    //   .then((respon) => {
    //     let Output = [
    //       {
    //         name: "Consumable",
    //         Progress: 0,
    //         Delivery: 0,
    //         Received: 0,
    //         OnTime: 0,
    //         "Not OnTime": 0,
    //       },
    //     ];
    //     respon.forEach((val) => {
    //       if (val.status == "Progress") {
    //         Output[0]["Progress"]++;
    //         if (dateNow <= new Date(val.deadlineDate)) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       } else if (val.status == "Delivery Process") {
    //         Output[0]["Delivery"]++;
    //         if (dateNow <= new Date(val.deadlineDate)) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       } else if (val.status == "Received") {
    //         Output[0]["Received"]++;
    //         if (val.solvedInTime) {
    //           Output[0]["OnTime"]++;
    //         } else {
    //           Output[0]["Not OnTime"]++;
    //         }
    //       }
    //     });
    //     let pencapaian = (Output[0]["OnTime"] / respon.length) * 100;
    //     res.status(200).json({
    //       data: Output,
    //       pencapaian: respon.length ? Math.ceil(pencapaian) : 100,
    //       target: 100,
    //     });
    //   })
    //   .catch(next);
  }

  static async importExcelStock(req, res, next) {
    const content = [];
    const busboy = new Busboy({ headers: req.headers });
    busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
      file.on("data", function (data) {
        const workbook = XLSX.read(data, { type: "array" });
        // workbook.SheetNames.forEach((sheetName) => {
        // });
        const xlRow = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);
        // console.log(workbook);
        content.push(...xlRow);
      });
    });

    busboy.on(
      "field",
      function (
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        console.log(
          "Field [" + fieldname + "]: value: " + inspect(val),
          "<<<<<"
        );
      }
    );
    busboy.on("finish", function () {
      let newTmp = content.map((val) => {
        return {
          kode: val["kode"],
          nama: val["nama"],
          satuan: val["satuan"],
          brand: val["brand"],
          spek: val["spek"],
          kategori: val["kategori"],
        };
      });
      // console.log(newTmp);
      CSStock.create(newTmp)
        .then((respon) => {
          res.status(200).json({
            message: "Stok baru berhasil ditambahkan",
            data: respon,
            status: 200,
          });
        })
        .catch(next);
    });
    req.pipe(busboy);
  }

  static getOrderItem(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    CSOrderStock.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csstocks",
          localField: "idStock",
          foreignField: "_id",
          as: "items",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$items", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { items: 0 } },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .find({
        $and: [
          { deadlineDate: { $lt: tglSelesai } },
          { deadlineDate: { $gt: tglMulai } },
        ],
      })
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }

  static getStockGudang(req, res, next) {
    CSStockGudang.find({})
      .sort({ nama: 1 })
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }

  static downloadStockGudang(req, res, next) {
    CSStockGudang.find({})
      .sort({ nama: 1 })
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }
  static addStockGudang(req, res, next) {
    let { kode, nama, stock, satuan, kategori, brand, spek } = req.body;
    let newKode = kode.toUpperCase();
    CSStockGudang.find({ kode: newKode })
      .then((respon) => {
        if (respon == "") {
          CSStockGudang.create({
            kode,
            nama,
            stock,
            minStock: stock,
            satuan,
            kategori,
            brand,
            spek,
          })
            .then((respon) => {
              res.status(200).json({ message: "Item berhasil ditambahkan!" });
            })
            .catch(next);
        } else {
          throw {
            message: "Sorry item is existing,Please update the item!",
            status: 400,
          };
        }
      })
      .catch(next);
  }

  static lakukanOrderGudang(req, res, next) {
    let { items, divisi } = req.body;
    let { nama, cabang, perusahaan } = req.decoded;
    let newItems = JSON.parse(items);
    CSOrderGudang.create({
      nama,
      divisi,
      history: [{ status: "Progress", date: new Date() }],
    })
      .then((respon) => {
        let tmp = newItems.map((val) => {
          return {
            idStockGudang: val.idItem,
            idOrderGudang: respon._id,
            hargaSatuan: val.harga,
            Qty: val.qty,
            diPesan: val.diPesan,
            totalHarga: val.totalHarga,
          };
        });

        return CSOrderStockGudang.create(tmp);
      })
      .then((respon) => {
        let tmp = newItems.map((val) => {
          return CSStockGudang.updateOne(
            { _id: val.idItem },
            { $inc: { stock: -1 * Number(val.qty) } }
          );
        });

        return Promise.all(tmp);
      })
      .then((respon) => {
        res.status(200).json({ message: "Pemesanan berhasil dilakukan!" });
      })
      .catch(next);
  }

  static getOrdersGudang(req, res, next) {
    CSOrderGudang.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csorderstockgudangs",
          let: {
            idOrderGudang: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$idOrderGudang", "$$idOrderGudang"] }],
                },
              },
            },
            {
              $lookup: {
                from: "csstockgudangs",
                let: {
                  idStockGudang: "$idStockGudang",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStockGudang"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }

  static updateOrderGudang(req, res, next) {
    let { idOrderGudang, status } = req.body;
    CSOrderGudang.findById(idOrderGudang)
      .then((respon) => {
        let date = new Date();
        respon.history = [
          { status: "Received", date: date },
          ...respon.history,
        ];
        respon.status = "Received";
        respon.arrivedDate = date;
        return respon.save();
      })
      .then((respon) => {
        res
          .status(200)
          .json({ message: "Status pemesanan berhasil diupdate!" });
      })
      .catch(next);
  }

  static getStockGudangLt(req, res, next) {
    CSStockGudang.find({})
      .sort({ nama: 1 })
      .then((respon) => {
        let tmp = respon.filter((val) => {
          return val.stock <= (75 / 100) * val.minStock;
        });
        res.status(200).json(tmp);
      })
      .catch(next);
  }

  static getBiaya(req, res, next) {
    CSOrderStock.find({})
      .sort({ createdAt: 1 })
      .then((respon) => {
        let Output = [
          {
            nama: "January",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "February",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "March",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "April",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "May",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "June",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "July",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "August",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "September",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "October",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "November",
            Cost: 0,
            Target: 94705945,
          },
          {
            nama: "December",
            Cost: 0,
            Target: 94705945,
          },
        ];
        // {
        //   January: 0,
        //   February: 0,
        //   March: 0,
        //   April: 0,
        //   May: 0,
        //   June: 0,
        //   July: 0,
        //   August: 0,
        //   September: 0,
        //   October: 0,
        //   November: 0,
        //   December: 0,
        // };
        respon.forEach((val) => {
          if (val.createdAt.getMonth() + 1 == 1) {
            Output[0]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 2) {
            Output[1]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 3) {
            Output[2]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 4) {
            Output[3]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 5) {
            Output[4]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 6) {
            Output[5]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 7) {
            Output[6]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 8) {
            Output[7]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 9) {
            Output[8]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 10) {
            Output[9]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 11) {
            Output[10]["Cost"] += val.totalHarga;
          } else if (val.createdAt.getMonth() + 1 == 12) {
            Output[11]["Cost"] += val.totalHarga;
          }
        });
        res.status(200).json(Output);
      })
      .catch(next);
  }

  static getOrdersDownload(req, res, next) {
    let { idOrder } = req.query;
    CSOrder.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csorderstocks",
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
            {
              $lookup: {
                from: "csstocks",
                let: {
                  idStock: "$idStock",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStock"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        let data = respon.filter((x) => x._id == idOrder);
        res.status(200).json(data[0].items);
      })

      .catch(next);
  }

  static getOrdersDownloadExcel(req, res, next) {
    let { idOrder } = req.query;
    CSOrder.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csorderstocks",
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
            {
              $lookup: {
                from: "csstocks",
                let: {
                  idStock: "$idStock",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStock"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        let data = respon.filter((x) => x._id == idOrder);
        // res.status(200).json(data[0].items);
        let resData = data[0].items.map((val) => {
          return {
            Kode: val.kode,
            "Nama Barang": val.nama,
            Spek: val.spek,
            Brand: val.brand,
            Jumlah: val.Qty,
            Satuan: val.satuan,
            Kategori: val.kategori,
          };
        });
        const sheetOrder = XLSX.utils.json_to_sheet(resData, {
          header: [
            "Kode",
            "Nama Barang",
            "Spek",
            "Brand",
            "Jumlah",
            "Satuan",
            "Kategori",
          ],
        });
        const sheetOrderCols = [
          { wpx: 200 }, //Kode
          { wpx: 200 }, //Nama Barang
          { wpx: 200 }, //Spek
          { wpx: 200 }, //Brand
          { wpx: 200 }, //Jumlah
          { wpx: 100 }, //Satuan
          { wpx: 200 }, //Satuan
        ];
        sheetOrder["!cols"] = sheetOrderCols;

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheetOrder, `Order`);
        XLSX.writeFile(wb, "Order.xlsx");
        let pathFile = path.join(__dirname, `../../Order.xlsx`);
        res.sendFile(pathFile);
      })

      .catch(next);
  }

  static getOrdersById(req, res, next) {
    let { idOrder } = req.query;
    CSOrder.aggregate([
      {
        $match: { _id: ObjectId(idOrder) },
      },
      {
        $lookup: {
          from: "csorderstocks",
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
            {
              $lookup: {
                from: "csstocks",
                let: {
                  idStock: "$idStock",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStock"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }

  static downloadOrderGudang(req, res, next) {
    let { idOrder } = req.query;
    CSOrderGudang.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "csorderstockgudangs",
          let: {
            idOrderGudang: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$idOrderGudang", "$$idOrderGudang"] }],
                },
              },
            },
            {
              $lookup: {
                from: "csstockgudangs",
                let: {
                  idStockGudang: "$idStockGudang",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idStockGudang"] }],
                      },
                    },
                  },
                ],
                as: "namasss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { namasss: 0 } },
          ],
          as: "items",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((respon) => {
        let data = respon.filter((x) => x._id == idOrder);
        res.status(200).json(data[0]);
      })
      .catch(next);
  }

  static updateStatusBarang(req, res, next) {
    let { idItem, hargaSatuan, totalHarga } = req.body;
    let date = new Date();
    CSOrderStock.findByIdAndUpdate(
      { _id: idItem },
      {
        hargaSatuan: hargaSatuan,
        totalHarga: totalHarga,
        statusBarang: "Delivery Process",
        deliverDate: date,
      }
    )
      .then((respon) => {
        res.status(200).json({
          message: "Berhasil Update",
        });
      })
      .catch(next);
    // CSOrderStock.updateMany(
    //   {
    //     hargaSatuan: 0,
    //   },
    //   {
    //     status: "Progress",
    //   }
    // )
    //   .then((respon) => {
    //     res.status(200).json({
    //       respon,
    //     });
    //   })
    //   .catch(next);
  }

  static updateStockGudang(req, res, next) {
    let { id, kode, Qty, deadLine } = req.body;
    let date = new Date();
    let diff = (date.getTime() - deadLine) / 7200000;
    let solved = diff <= 0 ? true : false;
    // console.log(diff, solved, id, kode, Qty, new Date(deadLine));

    CSOrderStock.findByIdAndUpdate(
      { _id: id },
      {
        statusBarang: "Received",
        arrivedDate: date,
        solvedInTime: solved,
      }
    )
      .then((respon) => {
        return CSStockGudang.findOneAndUpdate(
          { kode: kode },
          {
            $inc: { stock: Qty },
            status: "Full",
          }
        );
      })
      .then((response) => {
        res.status(200).json({ message: "Berhasil diupdate!" });
      })
      .catch(next);
  }
}

module.exports = Controller;
