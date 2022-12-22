const Axios = require("axios");
const Ruangan = require("../models/Ruangan");
const Gedung = require("../models/Gedung");
const Keluhan = require("../models/Keluhan");
const LaporanKebersihan = require("../models/LaporanKebersihan");
const ProblemKebersihan = require("../models/ProblemKebersihan");
const JadwalPatroli = require("../models/JadwalPatroli");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode");
const path = require("path");
const moment = require("moment");

class Controller {
  static daftarGedung(req, res, next) {
    let { gedung } = req.body;
    let { nama, cabang, perusahaan } = req.decoded;

    Gedung.create({ gedung, cabang, perusahaan })
      // .then((response) => {
      //   return Ruangan.findByIdAndUpdate(response._id, {
      //     koderuangan: String(response._id).slice(
      //       String(response._id).length - 6,
      //       String(response._id).length
      //     ),
      //   });
      // })
      .then((response) => {
        res.status(200).json({ message: "Gedung baru berhasil ditambahkan" });
      })
      .catch(next);
  }
  static daftarRuangan(req, res, next) {
    let { gedung, area, idShift } = req.body;
    let { nama, cabang, perusahaan } = req.decoded;

    Ruangan.create({ gedung, area, idShift })
      .then((response) => {
        return Ruangan.findByIdAndUpdate(response._id, {
          koderuangan: String(response._id).slice(
            String(response._id).length - 6,
            String(response._id).length
          ),
        });
      })
      .then((response) => {
        res.status(200).json({ message: "Ruangan baru berhasil ditambahkan" });
      })
      .catch(next);
  }

  static getRuangan(req, res, next) {
    let date = moment(new Date()).format("YYYY-MM-DD");
    const today = moment().utcOffset(7).startOf("day");
    JadwalPatroli.find({
      eventDate: {
        $gte: today.toDate(),
        $lte: moment(today).utcOffset(7).endOf("day").toDate(),
      },
    })
      .then((response) => {
        if (response.length == 0) {
          // let date1 = new Date("2022-07-07").getTime();
          Ruangan.aggregate([
            {
              $match: { status: "cj" },
            },
            {
              $lookup: {
                from: "shifts",
                localField: "idShift",
                foreignField: "_id",
                as: "shift",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{ $arrayElemAt: ["$shift", 0] }, "$$ROOT"],
                },
              },
            },
            { $project: { shift: 0 } },
          ])
            // Ruangan.find({ status: "cj" })
            .then((respon) => {
              respon.map((val) => {
                val.jam.map((val2) => {
                  return LaporanKebersihan.create({
                    ruangan: val._id,
                    gedung: val.gedung,
                    jamShift: val2,
                    tanggalDibuat: date,
                  });
                });
              });
            })
            .then((respons) => {
              res.status(200).json({ message: "Berhasil create" });
            })
            .catch(next);
        } else {
          console.log("Hari Libur Jam 01.00");
        }
      })
      .catch(next);
  }

  static getLaporanKunjunganAll(req, res, next) {
    const today = moment().utcOffset(7).startOf("day");
    JadwalPatroli.find({
      eventDate: {
        $gte: today.toDate(),
        $lte: moment(today).utcOffset(7).endOf("day").toDate(),
      },
    })
      .then((respon) => {
        if (respon.length == 0) {
          LaporanKebersihan.updateMany(
            {
              tanggalDibuat: {
                $gte: today.toDate(),
                $lte: moment(today).utcOffset(7).endOf("day").toDate(),
              },
              status: "Belum Dikunjungi",
            },
            {
              inTime: false,
              latitude: "-",
              longitude: "-",
              dilaporkanOleh: "-",
              status: "Tidak Dikunjungi",
            }
          )
            .then((respons) => {
              res.status(200).json({ message: "Berhasil di update" });
            })
            .catch(next);
        } else {
          console.log("Hari Libur Jam 23.00");
        }
      })
      .catch(next);
  }

  static getAreaByKodeRuangan(req, res, next) {
    let { ruangan } = req.query;
    let keluhan;
    let ruanganTmp;
    let problem;
    Ruangan.findOne({ koderuangan: ruangan })
      .populate("gedung")
      .then((response) => {
        if (!response) {
          throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
        }
        ruanganTmp = response;
        return ProblemKebersihan.aggregate([
          {
            $match: {
              status: "On Progress",
              gedung: ObjectId(ruanganTmp.gedung._id),
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
        ]);
      })
      .then((response) => {
        problem = response;
        return Keluhan.aggregate([
          {
            $match: {
              status: "On Progress",
              gedung: ObjectId(ruanganTmp.gedung._id),
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
        ]);
      })
      .then((response) => {
        keluhan = response;
        res.status(200).json({ ruangan: ruanganTmp, problem, keluhan });
      })
      .catch(next);
  }
  static getCategoryArea(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    Gedung.aggregate([
      {
        $match: { perusahaan, cabang },
      },
      {
        $sort: { gedung: 1 },
      },
      // {
      //   $lookup: {
      //     from: 'ruangans',
      //     localField: '_id',
      //     foreignField: 'gedung',
      //     as: 'ruangan',
      //   },
      // },
      {
        $lookup: {
          from: "ruangans",
          let: {
            idruangan: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$gedung", "$$idruangan"] }],
                },
              },
            },
            {
              $lookup: {
                from: "shifts",
                let: {
                  idshift: "$idShift",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idshift"] }],
                      },
                    },
                  },
                ],
                as: "shift",
              },
            },
          ],
          as: "ruangan",
        },
      },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getCategoryAreaAll(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    Gedung.aggregate([
      {
        $match: { perusahaan, cabang },
      },
      {
        $sort: { gedung: 1 },
      },
      {
        $lookup: {
          from: "ruangans",
          localField: "_id",
          foreignField: "gedung",
          as: "ruangan",
        },
      },
      { $unwind: "$ruangan" },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static deleteArea(req, res, next) {
    let { ruanganId } = req.body;
    Ruangan.deleteOne({ _id: ruanganId })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Ruangan berhasil dihapus!" });
      })
      .catch(next);
  }
  static editKodeRuangan(req, res, next) {
    let { _id, kodeRuangan } = req.body;
    Ruangan.findByIdAndUpdate(_id, { koderuangan: kodeRuangan })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Kode ruangan berhasil diupdate!" });
      })
      .catch(next);
  }

  static deleteGedung(req, res, next) {
    let { gedungId } = req.body;
    Ruangan.find({ gedung: gedungId })
      .then((response) => {
        if (response.length > 0) {
          throw {
            message:
              "Maaf masih ada ruangan didalam gedung ini! harap hapus terlebih dahulu ruangan tersebut!",
            status: 400,
          };
        } else {
          return Gedung.findByIdAndDelete(gedungId);
        }
      })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Gedung berhasil didelete!" });
      })
      .catch(next);
  }
  static getpdfruangan(req, res, next) {
    let { ruanganId } = req.query;
    let url = "https://fm.ptbap.net/survey/keluhan?kode=";
    // let url = "http://192.168.1.12:3000/survey/keluhan?kode=";
    let data;
    Ruangan.aggregate([
      {
        $match: { _id: ObjectId(ruanganId) },
      },
      {
        $lookup: {
          from: "gedungs",
          localField: "gedung",
          foreignField: "_id",
          as: "gedungsss",
        },
      },
      { $project: { gedung: 0 } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$gedungsss", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { gedungsss: 0 } },
    ])
      .then((response) => {
        url += response[0].koderuangan;
        data = response[0];
        return QRCode.toFile(path.join(__dirname, `../../qrruangan.png`), url);
      })
      .then((response) => {
        let doc = new PDFDocument({ bufferPages: true, size: "A4" });
        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          let pdfData = Buffer.concat(buffers);
          res
            .writeHead(200, {
              "Content-Length": Buffer.byteLength(pdfData),
              "Content-Type": "application/pdf",
              "Content-disposition": "attachment;filename=test.pdf",
            })
            .end(pdfData);
        });
        doc.pipe(fs.createWriteStream("TestDocument.pdf"));
        //  garis kiri;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(30, 40)
          .lineTo(30, 480)
          .stroke();
        //  garis atas;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(30, 40)
          .lineTo(200, 40)
          .stroke();
        //  garis kanan;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(200, 40)
          .lineTo(200, 480)
          .stroke();
        //  garis bawah;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(200, 480)
          .lineTo(30, 480)
          .stroke();
        doc.font("Helvetica-Bold").fontSize(12).text("IFM", 40, 50, {
          width: 150,
          align: "center",
        });
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Integrated Facility Management", 40, 65, {
            width: 150,
            align: "center",
          });
        doc
          .fontSize(12)
          .text(data.gedung, 30, 90, {
            width: 170,
            align: "center",
          })
          .text(data.area, {
            width: 170,
            align: "center",
          });

        doc
          .fontSize(8)
          .text(
            "Scan QR code dibawah untuk memberi masukkan (Feedback)!",
            40,
            137,
            {
              width: 150,
              align: "center",
            }
          );
        doc.image(path.join(__dirname, `../../qrruangan.png`), 35, 155, {
          width: 160,
        });

        doc
          .fontSize(8)
          .text("Scan NFC dibawah untuk melakukan patroli!", 50, 320, {
            width: 130,
            align: "center",
          });
        let center = 115;
        doc.image(path.join(__dirname, `../../nfcrb.png`), 68, 343, {
          width: 100,
        });
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 350)
        //   .lineTo(center - 35, 420)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center + 35, 350)
        //   .lineTo(center + 35, 420)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 350)
        //   .lineTo(center + 35, 350)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 420)
        //   .lineTo(center + 35, 420)
        //   .stroke();
        doc.rect(30, 430, 170, 60).fill("gray");
        doc.image(path.join(__dirname, `../../bap.png`), 70, 440, {
          width: 90,
        });
        doc.end();
      })
      .catch(next);
  }
  static getqrruangan(req, res, next) {
    let { ruanganId } = req.query;
    let url = "https://fm.ptbap.net/survey/keluhan?kode=";
    // let url = "http://192.168.1.12:3000/survey/keluhan?kode=";
    let data;
    Ruangan.aggregate([
      {
        $match: { _id: ObjectId(ruanganId) },
      },
      {
        $lookup: {
          from: "gedungs",
          localField: "gedung",
          foreignField: "_id",
          as: "gedungsss",
        },
      },
      { $project: { gedung: 0 } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$gedungsss", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { gedungsss: 0 } },
    ])
      .then((response) => {
        url += response[0].koderuangan;
        data = response[0];
        return QRCode.toFile(path.join(__dirname, `../../qrruangan.png`), url);
      })
      .then((response) => {
        let doc = new PDFDocument({ bufferPages: true, size: "A4" });
        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          let pdfData = Buffer.concat(buffers);
          res
            .writeHead(200, {
              "Content-Length": Buffer.byteLength(pdfData),
              "Content-Type": "application/pdf",
              "Content-disposition": "attachment;filename=test.pdf",
            })
            .end(pdfData);
        });
        doc.pipe(fs.createWriteStream("TestDocument.pdf"));
        //  garis kiri;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(30, 40)
          .lineTo(30, 380)
          .stroke();
        //  garis atas;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(30, 40)
          .lineTo(200, 40)
          .stroke();
        //  garis kanan;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(200, 40)
          .lineTo(200, 380)
          .stroke();
        //  garis bawah;
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(200, 380)
          .lineTo(30, 380)
          .stroke();
        doc.font("Helvetica-Bold").fontSize(12).text("IFM", 40, 50, {
          width: 150,
          align: "center",
        });
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Integrated Facility Management", 40, 65, {
            width: 150,
            align: "center",
          });
        doc
          .fontSize(12)
          .text(data.gedung, 30, 90, {
            width: 170,
            align: "center",
          })
          .text(data.area, {
            width: 170,
            align: "center",
          });

        doc
          .fontSize(8)
          .text(
            "Scan QR code dibawah untuk memberi masukkan (Feedback)!",
            40,
            137,
            {
              width: 150,
              align: "center",
            }
          );
        doc.image(path.join(__dirname, `../../qrruangan.png`), 35, 155, {
          width: 160,
        });

        // doc
        //   .fontSize(8)
        //   .text("Scan NFC dibawah untuk melakukan patroli!", 50, 320, {
        //     width: 130,
        //     align: "center",
        //   });
        // let center = 115;
        // doc.image(path.join(__dirname, `../../nfcrb.png`), 68, 343, {
        //   width: 100,
        // });
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 350)
        //   .lineTo(center - 35, 420)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center + 35, 350)
        //   .lineTo(center + 35, 420)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 350)
        //   .lineTo(center + 35, 350)
        //   .stroke();
        // doc
        //   .strokeColor("#aaaaaa")
        //   .lineWidth(1)
        //   .moveTo(center - 35, 420)
        //   .lineTo(center + 35, 420)
        //   .stroke();
        doc.rect(30, 320, 170, 60).fill("gray");
        doc.image(path.join(__dirname, `../../bap.png`), 70, 330, {
          width: 90,
        });
        doc.end();
      })
      .catch(next);
  }
  static getGedungsProblem(req, res, next) {
    let facets = {};

    Gedung.find({})
      .sort({ gedung: 1 })
      .then((response) => {
        response.forEach((val, index) => {
          facets[val.gedung] = [
            {
              $match: {
                gedung: val._id,
                status: "On Progress",
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ];
        });
        return ProblemKebersihan.aggregate([
          {
            $facet: facets,
          },
        ]);
      })
      .then((response) => {
        let tmp = [];
        Object.keys(response[0]).map((val, index) => {
          tmp.push({
            nama: val,
            items: response[0][val],
          });
        });

        res.status(200).json(tmp);
      })
      .catch(next);
  }
  static getGedungsKeluhan(req, res, next) {
    let facets = {};

    Gedung.find({})
      .sort({ gedung: 1 })
      .then((response) => {
        response.forEach((val, index) => {
          facets[val.gedung] = [
            {
              $match: {
                gedung: val._id,
                status: "On Progress",
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ];
        });
        return Keluhan.aggregate([
          {
            $facet: facets,
          },
        ]);
      })
      .then((response) => {
        let tmp = [];
        Object.keys(response[0]).map((val, index) => {
          tmp.push({
            nama: val,
            items: response[0][val],
          });
        });

        res.status(200).json(tmp);
      })
      .catch(next);
  }
}

module.exports = Controller;
