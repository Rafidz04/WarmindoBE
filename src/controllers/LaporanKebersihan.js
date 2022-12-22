const LaporanKebersihan = require("../models/LaporanKebersihan");
const ProblemKebersihan = require("../models/ProblemKebersihan");
const Keluhan = require("../models/Keluhan");
const Project = require("../models/Project");
const moment = require("moment");
const Gedung = require("../models/Gedung");
const Ruangan = require("../models/Ruangan");
const XLSX = require("xlsx");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Controller {
  static laporkanMonitoring(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { category, ruangan, title, deskripsi, latitude, longitude, gedung } =
      req.body;
    let valid = false;
    let date = new Date();
    let ruanganObj;

    // Ruangan.findById(ruangan)
    //   .populate("idShift")
    //   .then((response) => {
    //     if (response) {
    //       ruanganObj = response;
    //       if (response.idShift) {
    //         response.idShift.jam.forEach((val) => {
    //           let jamPatroli = new Date().setHours(val, 0, 0, 0);
    //           let diffTime = (date - jamPatroli) / 3600000;
    //           if (diffTime <= response.idShift.durasi) {
    //             valid = true;
    //           }
    //         });
    //         return LaporanKebersihan.create({
    //           inTime: valid,
    //           latitude,
    //           longitude,
    //           ruangan: ruanganObj._id,
    //           gedung: ruanganObj.gedung,
    //           dilaporkanOleh: nama,
    //         });
    //       } else {
    //         throw {
    //           message: "Maaf ruangan belum memiliki shift patroli!",
    //           status: 400,
    //         };
    //       }
    //       // return ProblemKebersihan.create(payload);
    //     } else {
    //       throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
    //     }
    //   })
    // .then((response) => {
    //   return
    ProblemKebersihan.create({
      title,
      category,
      deskripsi,
      dokumentasiAwalArr: req.body.foto,
      ruangan: ruangan,
      gedung: gedung,
      deadlineDate: date.setHours(date.getHours() + 24),
      progress: [
        {
          title: "On Progress",
          deskripsi:
            "Laporan telah diterima. Menunggu personil melakukan kunjungan.",
          date: date,
        },
      ],
    })
      // })
      .then((response) => {
        var data = JSON.stringify({
          to: "/topics/FCM",
          notification: {
            body: response.deskripsi,
            title: "Problem",
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
          message: "Terimakasih laporan anda berhasil kami tambahkan!",
        });
      })
      .catch(next);
  }

  static laporkanMonitoringTanpaMasalah(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { ruangan, latitude, longitude } = req.body;
    let dateLaporan = new Date();
    let date = new Date();
    let dateNow = moment(new Date()).format("YYYY-MM-DD");
    const today = moment().utcOffset(7).startOf("day");
    date.setHours(date.getHours() + 7);
    // const today = moment().startOf("day");
    // date.setHours(date.getHours());
    let tglMulai = new Date(date.toISOString());
    tglMulai.setHours(0);
    tglMulai.setMinutes(0);
    tglMulai.setSeconds(0);
    let tglSelesai = new Date(date.toISOString());
    tglSelesai.setHours(23);
    tglSelesai.setMinutes(59);
    tglSelesai.setSeconds(0);
    let shift1Awal = new Date(date.toISOString());
    shift1Awal.setHours(7);
    shift1Awal.setMinutes(0);
    shift1Awal.setSeconds(0);
    let shift1Akhir = new Date(date.toISOString());
    shift1Akhir.setHours(12);
    shift1Akhir.setMinutes(59);
    shift1Akhir.setSeconds(0);
    let shift2Awal = new Date(date.toISOString());
    shift2Awal.setHours(13);
    shift2Awal.setMinutes(0);
    shift2Awal.setSeconds(0);
    let shift2Akhir = new Date(date.toISOString());
    shift2Akhir.setHours(19);
    shift2Akhir.setMinutes(0);
    shift2Akhir.setSeconds(0);
    Ruangan.findById(ruangan)
      .populate("idShift")
      .then((response) => {
        if (
          date.getTime() <= shift1Akhir.getTime() &&
          date.getTime() >= shift1Awal.getTime()
        ) {
          let jamShift = 11;
          if (response) {
            let durasi = response.idShift.durasi;
            let valid = false;
            if (response.idShift) {
              return LaporanKebersihan.find({
                // tanggalDibuat: {
                //   $gte: today.toDate(),
                //   $lte: moment(today).utcOffset(7).endOf("day").toDate(),
                // },
                status: "Belum Dikunjungi",
                ruangan: ObjectId(ruangan),
                jamShift: 11,
              }).then((respon) => {
                // console.log("shift11", respon);
                if (respon.length == 0) {
                  throw {
                    message:
                      "Maaf laporan tidak ditemukan,silahkan menghubungi admin",
                    status: 400,
                  };
                } else {
                  if (respon[0].status == "Belum Dikunjungi") {
                    let jamAwalPatroli = new Date().setHours(
                      jamShift - durasi,
                      0,
                      0,
                      0
                    );
                    let jamAkhirPatroli = new Date().setHours(
                      jamShift,
                      0,
                      0,
                      0
                    );
                    if (date >= jamAwalPatroli && date <= jamAkhirPatroli) {
                      valid = true;
                    }
                    return LaporanKebersihan.findOneAndUpdate(
                      {
                        // tanggalDibuat: {
                        //   $gte: today.toDate(),
                        //   $lte: moment(today)
                        //     .utcOffset(7)
                        //     .endOf("day")
                        //     .toDate(),
                        // },
                        status: "Belum Dikunjungi",
                        ruangan: ObjectId(ruangan),
                        jamShift: 11,
                      },
                      {
                        inTime: valid,
                        latitude,
                        longitude,
                        dilaporkanOleh: nama,
                        tanggalKunjungan: dateLaporan,
                        status: "Telah Dikunjungi",
                      }
                    );
                  } else if (respon[0].status == "Telah Dikunjungi") {
                    throw {
                      message: "Maaf ruangan telah dikunjungi sebelumnya",
                      status: 400,
                    };
                  }
                }
              });
            } else {
              throw {
                message: "Maaf ruangan belum memiliki shift patroli!",
                status: 400,
              };
            }
          } else {
            throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
          }
        } else if (
          date.getTime() <= shift2Akhir.getTime() &&
          date.getTime() >= shift2Awal.getTime()
        ) {
          let jamShift = 16;
          if (response) {
            let durasi = response.idShift.durasi;
            let valid = false;
            if (response.idShift) {
              return LaporanKebersihan.find({
                // tanggalDibuat: {
                //   $gte: today.toDate(),
                //   $lte: moment(today).utcOffset(7).endOf("day").toDate(),
                // },
                status: "Belum Dikunjungi",
                ruangan: ObjectId(ruangan),
                jamShift: 16,
              }).then((respon) => {
                // console.log("shift16", respon);
                if (respon.length == 0) {
                  throw {
                    message:
                      "Maaf laporan tidak ditemukan,silahkan menghubungi admin",
                    status: 400,
                  };
                } else {
                  if (respon[0].status == "Belum Dikunjungi") {
                    let jamAwalPatroli = new Date().setHours(
                      jamShift - durasi,
                      0,
                      0,
                      0
                    );
                    let jamAkhirPatroli = new Date().setHours(
                      jamShift,
                      0,
                      0,
                      0
                    );
                    if (date >= jamAwalPatroli && date <= jamAkhirPatroli) {
                      valid = true;
                    }
                    return LaporanKebersihan.findOneAndUpdate(
                      {
                        // tanggalDibuat: {
                        //   $gte: today.toDate(),
                        //   $lte: moment(today)
                        //     .utcOffset(7)
                        //     .endOf("day")
                        //     .toDate(),
                        // },
                        status: "Belum Dikunjungi",
                        ruangan: ObjectId(ruangan),
                        jamShift: 16,
                      },
                      {
                        inTime: valid,
                        latitude,
                        longitude,
                        dilaporkanOleh: nama,
                        tanggalKunjungan: dateLaporan,
                        status: "Telah Dikunjungi",
                      }
                    );
                  } else if (respon[0].status == "Telah Dikunjungi") {
                    throw {
                      message: "Maaf ruangan telah dikunjungi sebelumnya",
                      status: 400,
                    };
                  }
                }
              });
            } else {
              throw {
                message: "Maaf ruangan belum memiliki shift patroli!",
                status: 400,
              };
            }
          } else {
            throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
          }
        } else {
          throw {
            message: "Maaf anda berada di luar jam kerja!",
            status: 400,
          };
        }
      })

      .then((response) => {
        console.log(response, ">>>>>>>>>>>.");
        res.status(200).json({
          data: response,
          message: "Terimakasih laporan anda berhasil kami tambahkan!",
        });
      })
      .catch(next);

    // let { nama, cabang, perusahaan } = req.decoded;
    // let { ruangan, latitude, longitude } = req.body;
    // let valid = false;
    // let date = new Date();
    // let ruanganObj;

    // Ruangan.findById(ruangan)
    //   .populate("idShift")
    //   .then((response) => {
    //     if (response) {
    //       ruanganObj = response;
    //       if (response.idShift) {
    //         response.idShift.jam.forEach((val) => {
    //           let jamPatroli = new Date().setHours(val, 0, 0, 0);
    //           let diffTime = (date - jamPatroli) / 3600000;
    //           if (diffTime <= response.idShift.durasi) {
    //             valid = true;
    //           }
    //         });
    //         return LaporanKebersihan.create({
    //           inTime: valid,
    //           latitude,
    //           longitude,
    //           ruangan: ruanganObj._id,
    //           gedung: ruanganObj.gedung,
    //           dilaporkanOleh: nama,
    //         });
    //       } else {
    //         throw {
    //           message: "Maaf ruangan belum memiliki shift patroli!",
    //           status: 400,
    //         };
    //       }
    //       // return ProblemKebersihan.create(payload);
    //     } else {
    //       throw { message: "Maaf ruangan tidak ditemukan", status: 400 };
    //     }
    //   })

    //   .then((response) => {
    //     res.status(200).json({
    //       message: "Terimakasih laporan anda berhasil kami tambahkan!",
    //     });
    //   })
    //   .catch(next);
  }

  static verifyProblem(req, res, next) {
    let { nama } = req.decoded;
    let { status, idProblem, title, deskripsi, dariTgl, smpTgl, keterangan } =
      req.body;
    let date = new Date();
    let problem;
    ProblemKebersihan.findById(idProblem)
      .then((response) => {
        if (response) {
          problem = response;

          if (
            problem.dokumentasiAkhirArr &&
            problem.dokumentasiAkhirArr.length !== 0
          ) {
            problem.dokumentasiAkhirArr = [
              ...problem.dokumentasiAkhirArr,
              ...req.body.foto,
            ];
          } else {
            problem.dokumentasiAkhirArr = req.body.foto;
          }

          if (status === "Done") {
            problem.solvedDate = date;
            problem.keterangan = keterangan;
            if (problem.status !== "B&U" && problem.status !== "Project") {
              problem.responDate = date;
            } else {
              problem.deadlineDate = new Date(problem.deadlineDate).setFullYear(
                new Date(problem.deadlineDate).getFullYear() + 1
              );
            }
            problem.progress = [
              {
                title: "Done",
                deskripsi: "Laporan telah selesai ditindaklanjuti",
                date: date,
              },
              ...problem.progress,
            ];
          } else if (status === "B&U") {
            problem.responDate = date;
            problem.keterangan = keterangan;
            problem.progress = [
              {
                title: "Telah dikunjungi",
                deskripsi:
                  "Lokasi telah dikunjungi dan dilaporkan ke lembaga terkait",
                date: date,
              },
              ...problem.progress,
            ];
          } else if (status === "Project") {
            problem.responDate = date;
            problem.keterangan = keterangan;
            problem.progress = [
              {
                title: "Telah dikunjungi",
                deskripsi: "Lokasi telah dikunjungi dan akan ditindaklanjuti",
                date: date,
              },
              ...problem.progress,
            ];
            problem.status = status;
            return Project.create({
              diajukanOleh: nama,
              title,
              deskripsi,
              ruangan: problem.ruangan,
              gedung: problem.gedung,
              filePendukung: problem.dokumentasiAwalArr,
              startDate: date,
              deadlineDate: new Date(Number(smpTgl)),
            }).then((response) => {
              return problem.save();
            });
          }
          problem.status = status;
          return problem.save();
        } else {
          throw { message: "Maaf laporan tidak ditemukan", status: 400 };
        }
      })
      .then((response) => {
        res.status(200).json({
          message: "Terimakasih laporan berhasil diupdate",
        });
      })
      .catch(next);
  }

  static pelaporanKebersihan(req, res, next) {
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
        return ProblemKebersihan.aggregate([
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
  static getRekapProblem(req, res, next) {
    ProblemKebersihan.aggregate([
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
  static getgrafikkunjungan(req, res, next) {
    // let { dari, sampai } = req.query;

    // let tglMulai = new Date(Number(dari));
    // let tglSelesai = new Date(Number(sampai));

    // Gedung.find({})
    //   .sort({ gedung: 1 })
    //   .then((response) => {
    //     let facets = {};
    //     response.forEach((val, index) => {
    //       facets[val.gedung] = [
    //         {
    //           $match: {
    //             gedung: val._id,
    //             createdAt: { $gt: tglMulai, $lt: tglSelesai },
    //           },
    //         },
    //       ];
    //     });
    //     return LaporanKebersihan.aggregate([
    //       {
    //         $facet: facets,
    //       },
    //     ]);
    //   })
    //   .then((response) => {
    //     // console.log(response[0].Anjasmoro);
    //     let output = [];
    //     let score = 0;
    //     Object.keys(response[0]).forEach((val, index) => {
    //       output[index] = {
    //         name: val,
    //         Total: 0,
    //         OnTime: 0,
    //         "Not OnTime": 0,
    //       };
    //       let kunjunganMinSekali = false;
    //       response[0][val].forEach((val2, index2) => {
    //         output[index].Total++;
    //         if (val2.inTime) {
    //           kunjunganMinSekali = true;
    //           output[index]["OnTime"]++;
    //         } else {
    //           output[index]["Not OnTime"]++;
    //         }
    //       });
    //       if (kunjunganMinSekali) {
    //         score++;
    //       }
    //     });
    //     let pencapaian = (score / Object.keys(response[0]).length) * 100;
    //     res.status(200).json({
    //       data: output,
    //       pencapaian: Math.ceil(pencapaian),
    //       target: 100,
    //     });
    //   })
    //   .catch(next);
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
        return LaporanKebersihan.aggregate([
          {
            $facet: facets,
          },
        ]);
      })
      .then((response) => {
        let output = [];
        let solve = 0;
        let total = 0;
        Object.keys(response[0]).forEach((val, index) => {
          output[index] = {
            name: val,
            Total: 0,
            OnTime: 0,
            "Not OnTime": 0,
            "Not Visited": 0,
            "No Visit Yet": 0,
          };
          response[0][val].forEach((val2, index2) => {
            total++;
            if (val2.status == "Belum Dikunjungi") {
              output[index]["No Visit Yet"]++;
            } else if (val2.status == "Tidak Dikunjungi") {
              output[index]["Not Visited"]++;
            } else if (val2.status == "Telah Dikunjungi") {
              output[index].Total++;
              if (val2.inTime) {
                solve++;
                output[index]["OnTime"]++;
              } else {
                output[index]["Not OnTime"]++;
              }
            }
          });
        });
        let pencapaian = (solve / total) * 100;
        res.status(200).json({
          data: output,
          pencapaian: Math.ceil(pencapaian),
          target: 100,
        });
        // res.status(200).json({
        //   data: response,
        // pencapaian: Math.ceil(pencapaian),
        // target: 100,
        // });
      })
      .catch(next);
  }
  static getrekaplaporan(req, res, next) {
    LaporanKebersihan.aggregate([
      {
        $match: {},
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
          as: "ruangan",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$ruangan", 0] }, "$$ROOT"],
          },
        },
      },
      {
        $lookup: {
          from: "gedungs",
          let: {
            idgedung: "$gedung",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$idgedung"] }],
                },
              },
            },
          ],
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
      { $project: { ruangan: 0, gedungsss: 0 } },
      { $sort: { createdAt: -1 } },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static getHistory(req, res, next) {
    let keluhan;
    let problem;

    ProblemKebersihan.aggregate([
      {
        $match: {
          status: "On Progress",
        },
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
          as: "ruangan",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$ruangan", 0] }, "$$ROOT"],
          },
        },
      },
      {
        $lookup: {
          from: "gedungs",
          let: {
            idgedung: "$gedung",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$idgedung"] }],
                },
              },
            },
          ],
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

      { $project: { ruangan: 0, laporan: 0, gedungsss: 0 } },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((response) => {
        problem = response;
        return Keluhan.aggregate([
          {
            $match: {
              status: "On Progress",
            },
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
              as: "ruangan",
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [{ $arrayElemAt: ["$ruangan", 0] }, "$$ROOT"],
              },
            },
          },
          {
            $lookup: {
              from: "gedungs",
              let: {
                idgedung: "$gedung",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$_id", "$$idgedung"] }],
                    },
                  },
                },
              ],
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
          { $project: { ruangan: 0, gedungsss: 0 } },
          {
            $sort: { createdAt: -1 },
          },
        ]);
      })
      .then((response) => {
        keluhan = response;
        res.status(200).json({ problem, keluhan });
      })
      .catch(next);
  }

  static getexportbandu(req, res, next) {
    let { dari, sampai } = req.query;
    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    let keluhanArr = [];
    Keluhan.aggregate([
      {
        $match: {
          status: "B&U",
          createdAt: { $gt: tglMulai, $lt: tglSelesai },
        },
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
        $sort: { bnuDate: -1 },
      },
    ])
      .then((response) => {
        keluhanArr = response;
        return ProblemKebersihan.aggregate([
          {
            $match: {
              status: "B&U",
              createdAt: { $gt: tglMulai, $lt: tglSelesai },
            },
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
            $sort: { bnuDate: -1 },
          },
        ]);
      })
      .then((response) => {
        let data = keluhanArr.map((val) => {
          return {
            Masalah: val.deskripsi,
            Ruangan: val.area,
            Gedung: val.gedung,
            "Tgl. dilaporkan": moment(val.createdAt).format(
              "DD-MM-YYYY, h:mm:ss"
            ),
            "Tgl. B&U": moment(val.bnuDate).format("DD-MM-YYYY, h:mm:ss"),
            Status: val.status,
            Dokumentasi: val.dokumentasiAwalArr.join(", "),
          };
        });
        const sheetKeluhan = XLSX.utils.json_to_sheet(data, {
          header: [
            "Masalah",
            "Ruangan",
            "Gedung",
            "Tgl. dilaporkan",
            "Tgl. B&U",
            "Status",
            "Dokumentasi",
          ],
        });
        const sheetKeluhanCols = [
          { wpx: 200 }, //Masalah
          { wpx: 100 }, //Ruangan
          { wpx: 100 }, //Gedung
          { wpx: 120 }, //Tgl. dilaporkan
          { wpx: 120 }, //Tgl. Bnu
          { wpx: 60 }, // Status
          { wpx: 150 }, // Dokumentasi
        ];
        sheetKeluhan["!cols"] = sheetKeluhanCols;
        /////////////////////////////////////////////////////////
        let data2 = response.map((val) => {
          return {
            Kategori: val.category,
            Judul: val.title,
            Masalah: val.deskripsi,
            Ruangan: val.area,
            Gedung: val.gedung,
            "Tgl. dilaporkan": moment(val.createdAt).format(
              "DD-MM-YYYY, h:mm:ss"
            ),
            "Tgl. B&U": moment(val.bnuDate).format("DD-MM-YYYY, h:mm:ss"),
            Status: val.status,
            Dokumentasi: val.dokumentasiAwalArr.join(", "),
          };
        });
        const sheetProblem = XLSX.utils.json_to_sheet(data2, {
          header: [
            "Kategori",
            "Judul",
            "Masalah",
            "Ruangan",
            "Gedung",
            "Tgl. dilaporkan",
            "Tgl. B&U",
            "Status",
            "Dokumentasi",
          ],
        });
        const sheetProblemCols = [
          { wpx: 100 }, //Kategori
          { wpx: 160 }, //Judul
          { wpx: 200 }, //Masalah
          { wpx: 100 }, //Ruangan
          { wpx: 100 }, //Gedung
          { wpx: 120 }, //Tgl. dilaporkan
          { wpx: 120 }, //Tgl. Bnu
          { wpx: 60 }, // Status
          { wpx: 150 }, // Dokumentasi
        ];
        sheetProblem["!cols"] = sheetProblemCols;
        var wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          wb,
          sheetProblem,
          `Problem_${moment(tglMulai).format("DD-MM-YY")}_${moment(
            tglSelesai
          ).format("DD-MM-YY")}`
        );
        XLSX.utils.book_append_sheet(
          wb,
          sheetKeluhan,
          `Keluhan_${moment(tglMulai).format("DD-MM-YY")}_${moment(
            tglSelesai
          ).format("DD-MM-YY")}`
        );

        XLSX.writeFile(wb, "B&U.xlsx");
        let pathFile = path.join(__dirname, `../../B&U.xlsx`);
        res.sendFile(pathFile);
      })
      .catch(next);
  }

  static getHistoriKunjunganGedung(req, res, next) {
    let tgl = req.query;
    let tglMulai = new Date(Number(tgl.dateAwal));
    let tglSelesai = new Date(Number(tgl.dateAkhir));
    // let date = new Date();
    // date.setHours(date.getHours() + 7);
    // let tglMulai = new Date(date.toISOString());
    // tglMulai.setHours(0);
    // tglMulai.setMinutes(0);
    // tglMulai.setSeconds(0);
    // let tglSelesai = new Date(date.toISOString());
    // tglSelesai.setHours(23);
    // tglSelesai.setMinutes(59);
    // tglSelesai.setSeconds(0);

    // console.log(tglMulai, tglSelesai);
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
                as: "ruangannss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    { $arrayElemAt: ["$ruangannss", 0] },
                    "$$ROOT",
                  ],
                },
              },
            },
            { $project: { ruangannss: 0 } },
            {
              $lookup: {
                from: "shifts",
                let: { idShift: "$idShift" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$idShift"] }],
                      },
                    },
                  },
                ],
                as: "shiftssss",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    { $arrayElemAt: ["$shiftssss", 0] },
                    "$$ROOT",
                  ],
                },
              },
            },
            { $project: { shiftssss: 0 } },
          ];
        });
        return LaporanKebersihan.aggregate([
          {
            $facet: facets,
          },
        ]);
      })
      .then((response) => {
        console.log(response);
        let tmp = [];
        Object.keys(response[0]).map((val, index) => {
          tmp[index] = {
            nama: val,
            Target: 0,
            "Telah Dikunjungi": 0,
            "Belum Dikunjungi": 0,
          };
          response[0][val].forEach((val2) => {
            tmp[index].Target++;
            if (val2.status == "Belum Dikunjungi") {
              tmp[index]["Belum Dikunjungi"]++;
            } else if (val2.status == "Telah Dikunjungi") {
              tmp[index]["Telah Dikunjungi"]++;
            }
          });
          // tmp.push({
          //   nama: val,
          //   item: response[0][val],
          // });
        });

        res.status(200).json(tmp);
      })
      .catch(next);
  }

  static deletedLaporanKunjungan(req, res, next) {
    let { laporanId } = req.body;
    LaporanKebersihan.findByIdAndDelete(laporanId)
      .then((respon) => {
        res.status(200).json({ message: "Laporan berhasil dihapus!" });
      })
      .catch(next);
  }

  static kirimKeteranganKunjungan(req, res, next) {
    let { idKunjungan, keterangan } = req.body;

    LaporanKebersihan.findByIdAndUpdate(
      { _id: idKunjungan },
      { keterangan: keterangan }
    )
      .then((response) => {
        res
          .status(200)
          .json({ data: response, message: "Laporan berhasil dihapus!" });
      })
      .catch(next);
  }
}

module.exports = Controller;
