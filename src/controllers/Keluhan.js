const Keluhan = require("../models/Keluhan");
const Gedung = require("../models/Gedung");
const Ruangan = require("../models/Ruangan");
const LaporanKebersihan = require("../models/LaporanKebersihan");
const ProblemKebersihan = require("../models/ProblemKebersihan");
const Project = require("../models/Project");
var axios = require("axios");

const moment = require("moment");
class Controller {
  static daftarKeluhan(req, res, next) {
    let { nama, noHp, deskripsi, koderuangan } = req.body;
    let date = new Date();
    Ruangan.findOne({ koderuangan })
      .then((response) => {
        if (response) {
          return Keluhan.create({
            nama,
            noHp,
            deskripsi,
            ruangan: response._id,
            gedung: response.gedung,
            dokumentasiAwalArr: req.body.foto,
            deadlineDate: date.setHours(date.getHours() + 24),
            progress: [
              {
                title: "On Progress",
                deskripsi:
                  "Laporan telah diterima. Menunggu personil melakukan kunjungan.",
                date: new Date(),
              },
            ],
          });
        } else {
          throw {
            message:
              "Mohon maaf ruangan ini tidak terdaftar. Mohon menghubungi Facility Management!",
          };
        }
      })
      .then((response) => {
        var data = JSON.stringify({
          to: "/topics/FCM",
          notification: {
            body: response.deskripsi,
            title: "Keluhan",
          },
        });

        var config = {
          method: "post",
          url: "https://fcm.googleapis.com/fcm/send",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "key=AAAAMvTcrEo:APA91bGYqRugYPwCm60blJK2z-ZluXSWynQuReWIPe-E0nJuWQci40Pc4f6UUuHdQEt5ZIqszNLPPefqpmXJyLzAsmUIHuayHiJP_bcK8lyUveHnesxCrdFPzwZ43fwJ8niTO_fX_zl2",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            // console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            // console.log(error);
          });
        res.status(200).json({
          link: `https://fm.ptbap.net/survey/keluhan-progress?id=${response._id}`,
          message:
            "Mohon maaf atas ketidak nyamanan anda. Kami akan segera menindak lanjuti keluhan anda!",
        });
      })
      .catch(next);
  }

  static getTimeLine(req, res, next) {
    let { id } = req.query;

    Keluhan.findById(id)
      .populate("ruangan")
      .populate("gedung")
      .then((response) => {
        if (response) {
          res.status(200).json(response);
        } else {
          throw { message: "Keluhan tidak ditemukan", status: 400 };
        }
      })
      .catch(next);
  }
  static verifyKeluhan(req, res, next) {
    let { nama } = req.decoded;
    let { status, idKeluhan, title, deskripsi, dariTgl, smpTgl, keterangan } =
      req.body;
    let date = new Date();
    let keluhan;
    console.log(new Date(new Date(Number(smpTgl)).setHours(23)));
    Keluhan.findById(idKeluhan)
      .then((response) => {
        if (response) {
          keluhan = response;

          if (
            keluhan.dokumentasiAkhirArr &&
            keluhan.dokumentasiAkhirArr.length !== 0
          ) {
            keluhan.dokumentasiAkhirArr = [
              ...keluhan.dokumentasiAkhirArr,
              ...req.body.foto,
            ];
          } else {
            keluhan.dokumentasiAkhirArr = req.body.foto;
          }
          if (status === "Done") {
            keluhan.solvedDate = date;
            keluhan.keterangan = keterangan;
            if (keluhan.status !== "B&U" && keluhan.status !== "Project") {
              keluhan.responDate = date;
            } else {
              keluhan.deadlineDate = new Date(keluhan.deadlineDate).setFullYear(
                new Date(keluhan.deadlineDate).getFullYear() + 1
              );
            }
            keluhan.progress = [
              {
                title: "Done",
                deskripsi: "Laporan telah selesai ditindaklanjuti",
                date: date,
              },
              ...keluhan.progress,
            ];
          } else if (status === "B&U") {
            keluhan.responDate = date;
            keluhan.keterangan = keterangan;
            keluhan.progress = [
              {
                title: "Telah dikunjungi",
                deskripsi:
                  "Lokasi telah dikunjungi dan dilaporkan ke lembaga terkait",
                date: date,
              },
              ...keluhan.progress,
            ];
          } else if (status === "Project") {
            keluhan.responDate = date;
            keluhan.keterangan = keterangan;
            keluhan.progress = [
              {
                title: "Telah dikunjungi",
                deskripsi: "Lokasi telah dikunjungi dan akan ditindaklanjuti",
                date: date,
              },
              ...keluhan.progress,
            ];
            keluhan.status = status;

            return Project.create({
              diajukanOleh: nama,
              title,
              deskripsi,
              ruangan: keluhan.ruangan,
              gedung: keluhan.gedung,
              filePendukung: keluhan.dokumentasiAwalArr,
              startDate: date,
              deadlineDate: new Date(new Date(Number(smpTgl)).setHours(23)),
            }).then((response) => {
              return keluhan.save();
            });
          }
          keluhan.status = status;

          return keluhan.save();
        } else {
          throw { message: "Maaf keluhan tidak ditemukan", status: 400 };
        }
      })
      .then((response) => {
        res.status(200).json({
          message: "Terimakasih keluhan berhasil diupdate",
        });
      })
      .catch(next);
  }
  static getKeluhanByRuangan(req, res, next) {
    let { ruangan } = req.query;
    let ruangans;
    Ruangan.findOne({ koderuangan: ruangan })
      .populate("gedung")
      .then((response) => {
        if (!response) {
          throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
        }
        ruangans = response;
        return Keluhan.aggregate([
          {
            $match: { ruangan: ruangans._id },
          },
          {
            $lookup: {
              from: "ruangans",
              let: {
                idruangan: "$ruangan",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$idruangan"] }],
                    },
                  },
                },
              ],
              as: "ruangans",
            },
          },
        ]);
      })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static getKeluhanAll(req, res, next) {
    Keluhan.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "ruangans",
          let: { idRuangan: "$ruangan" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$idRuangan"] }],
                },
              },
            },
          ],
          as: "ruangans",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$ruangans", 0] }, "$$ROOT"],
          },
        },
      },
      {
        $lookup: {
          from: "gedungs",
          let: { idRuangan: "$gedung" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$idRuangan"] }],
                },
              },
            },
          ],
          as: "gedungs",
        },
      },
      { $project: { gedung: 0 } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$gedungs", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { ruangans: 0, gedungs: 0, ruangan: 0 } },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static keluhangrafik(req, res, next) {
    let { dari, sampai } = req.query;
    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    Gedung.find({})
      .sort({ gedung: 1 })
      .then((response) => {
        let facets = {};
        response.forEach((val, index) => {
          facets[val.gedung] = [
            {
              $match: {
                gedung: val._id,
                createdAt: { $gt: tglMulai, $lt: tglSelesai },
              },
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
        let output = [];
        let solved = 0;
        let total = 0;
        Object.keys(response[0]).forEach((val, index) => {
          output[index] = {
            name: val,
            "On Progress": 0,
            Solved: 0,
            "Outside FM": 0,
            Project: 0,
            OnTime: 0,
            "Not OnTime": 0,
          };
          response[0][val].forEach((val2, index2) => {
            total++;
            if (val2.status === "Done") {
              output[index]["Solved"]++;
              if (new Date(val2.solvedDate) < new Date(val2.deadlineDate)) {
                output[index]["OnTime"]++;

                solved++;
              } else {
                output[index]["Not OnTime"]++;
              }
            } else if (val2.status === "B&U") {
              output[index]["Outside FM"]++;
              if (new Date(val2.responDate) < new Date(val2.deadlineDate)) {
                output[index]["OnTime"]++;

                solved++;
              } else {
                output[index]["Not OnTime"]++;
              }
            } else if (val2.status === "Project") {
              output[index]["Project"]++;
              if (new Date(val2.responDate) < new Date(val2.deadlineDate)) {
                output[index]["OnTime"]++;

                solved++;
              } else {
                output[index]["Not OnTime"]++;
              }
            } else {
              output[index]["On Progress"]++;
              if (new Date() < new Date(val2.deadlineDate)) {
                output[index]["OnTime"]++;

                solved++;
              } else {
                output[index]["Not OnTime"]++;
              }
            }
          });
        });

        let pencapaian = (solved / total) * 100;
        res.status(200).json({
          data: output,

          pencapaian: total ? Math.ceil(pencapaian) : 100,
          target: 100,
        });
      })
      .catch(next);
  }
}

module.exports = Controller;
