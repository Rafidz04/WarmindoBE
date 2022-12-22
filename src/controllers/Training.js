const Training = require("../models/Training");
const AbsenKaryawan = require("../models/AbsenKaryawan");
const JadwalPatroli = require("../models/JadwalPatroli");
const Project = require("../models/Project");
const Pembinaan = require("../models/Pembinaan");
const KunjunganPest = require("../models/KunjunganPestRodent");
const VisitIndustrialIssue = require("../models/VisitIndustrialIssue");
// const LaporanKebersihan = require("../models/LaporanKebersihan");
const path = require("path");
const Busboy = require("busboy");
const XLSX = require("xlsx");
const Axios = require("axios");
const moment = require("moment");

class Controller {
  static ajukanTraining(req, res, next) {
    let { nama } = req.decoded;
    let { jenisTraining, deskripsi, startDate, deadlineDate } = req.body;
    Training.create({
      diajukanOleh: nama,
      jenisTraining,
      deskripsi,
      startDate,
      deadlineDate,
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan training berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responTraining(req, res, next) {
    let { nama } = req.decoded;
    let { trainingId, respon, alasan, keterangan } = req.body;
    let training;
    let date = new Date();
    Training.findById(trainingId)
      .then((response) => {
        training = response;
        training.diresponOleh = nama;
        if (respon === "Received") {
          if (training.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          training.alasan = "";
        } else if (respon === "Rejected") {
          if (training.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          training.alasan = alasan;
        } else if (respon === "Done") {
          if (training.status === "Waiting for Approval") {
            throw { message: "Maaf, training belum disetujui!", status: 400 };
          } else if (training.status === "Rejected") {
            throw {
              message: "Maaf, training ditolak dan tidak dapat diselesaikan!",
              status: 400,
            };
          }
          training.alasan = "";
          training.solvedDate = date;
          training.keterangan = keterangan;
          let dateLama = new Date(training.deadlineDate);
          // dateLama.setHours(24, 0, 0, 0);
          var diff = (date - dateLama) / 3600000;
          training.solvedInTime = diff <= 24 ? true : false;
          training.buktiSelesai = req.body.foto;
        }
        training.status = respon;
        return training.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, training berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static ajukanTrainingUlang(req, res, next) {
    let { nama } = req.decoded;
    let { trainingId, startDate, deadlineDate } = req.body;
    let training;
    let date = new Date(startDate);
    Training.findById(trainingId)
      .then((response) => {
        training = response;
        training.status = "Waiting for Approval";
        training.diajukanOleh = nama;
        training.diresponOleh = "";
        training.alasan = "";
        training.startDate = startDate;
        training.deadlineDate = deadlineDate;
        return training.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, training berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getTrainingAll(req, res, next) {
    Training.find({})
      .sort({ startDate: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getTrainingByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    Training.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getGrafikTraining(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    Training.find({
      $or: [{ status: "Received" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Training Program",
            "On Time": 0,
            "Not Ontime": 0,
          },
        ];

        respon.forEach((val) => {
          if (val.status == "Done" && val.solvedInTime == true) {
            Output[0]["On Time"]++;
          } else if (val.status == "Done" && val.solvedInTime == false) {
            Output[0]["Not Ontime"]++;
          } else if (
            val.status == "Received" &&
            new Date() <= new Date(val.deadlineDate)
          ) {
            Output[0]["On Time"]++;
          } else {
            Output[0]["Not Ontime"]++;
          }
        });
        let pencapaian = (Output[0]["On Time"] / respon.length) * 100;
        res.status(200).json({
          data: Output,
          pencapaian: respon.length ? Math.ceil(pencapaian) : 100,
          target: 100,
        });
      })
      .catch(next);
  }
  static getTrainingCalendar(req, res, next) {
    Training.aggregate([
      {
        $match: {
          status: "Received",
        },
      },
    ])
      .then((response) => {
        let hasil = response.map((val, index) => {
          return {
            title: val.jenisTraining,
            allDay: true,
            start: val.startDate,
            end: val.deadlineDate,
            // color: "default",
          };
        });
        res.status(200).json(hasil);
      })
      .catch(next);
  }

  static async importExcelAbsensi(req, res, next) {
    // console.log(req.headers);
    const content = [];
    const busboy = new Busboy({ headers: req.headers });
    busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
      file.on("data", function (data) {
        const workbook = XLSX.read(data, { type: "array" });
        // workbook.SheetNames.forEach((sheetName) => {
        // });
        // console.log(workbook);
        const xlRow = XLSX.utils.sheet_to_json(
          workbook.Sheets["AbsenKaryawan"]
        );
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
          nopeg: val["nopeg"],
          nama: val["nama"],
          jabatan: val["jabatan"],
          tanggal: new Date(
            Math.round((val["tanggal"] - 25569) * 86400 * 1000)
          ),
          checkIn: val["checkIn"],
          checkOut: val["checkOut"],
          keterangan: val["keterangan"],
        };
      });
      // console.log(newTmp);
      AbsenKaryawan.create(newTmp)
        .then((respon) => {
          res.status(200).json({
            message: "Absensi baru berhasil ditambahkan",
            data: respon,
            status: 200,
          });
        })
        .catch(next);
    });
    req.pipe(busboy);
  }

  static getAbsensiAll(req, res, next) {
    Axios.get("https://backoffice.bapguard.com/api/hadirjti?departemen=ifm")
      // Axios.get("http://192.168.149.217/bap/public/api/hadirjti?departemen=ifm")
      .then(async (response) => {
        let { dari, sampai } = req.query;
        let hasil = response.data.data.filter((val) => {
          return val.tgl_masuk >= dari && val.tgl_masuk <= sampai;
        });
        res.status(200).json(hasil);
        // console.log(hasil.length);
      })
      .catch((err) => {
        // console.log(err);
      });
    // AbsenKaryawan.find({})
    //   .sort({ tanggal: -1 })
    //   .then((response) => {
    //     res.status(200).json(response);
    //   })
    //   .catch(next);
  }

  static exportAbsensibyDate(req, res, next) {
    // Axios.get("http://192.168.149.217/bap/public/api/hadirjti?departemen=ifm")
    Axios.get("https://backoffice.bapguard.com/api/hadirjti?departemen=ifm")
      .then((response) => {
        // console.log(response.data.data[0]);
        let { dari, sampai } = req.query;
        let splitDari = dari.split("-");
        let splitSampai = sampai.split("-");
        // console.log(splitDari);
        let fixDari = new Date(
          splitDari[0],
          splitDari[1] - 1,
          splitDari[2]
        ).getTime();
        let fixSampai = new Date(
          splitSampai[0],
          splitSampai[1] - 1,
          splitSampai[2]
        ).getTime();
        // console.log(fixDari, fixSampai);
        let hasil = response.data.data.filter((val) => {
          let splitTglMasuk = val.tgl_masuk.split("-");
          let fixTglMasuk = new Date(
            splitTglMasuk[0],
            splitTglMasuk[1] - 1,
            splitTglMasuk[2]
          ).getTime();
          return fixTglMasuk >= fixDari && fixTglMasuk <= fixSampai;
        });
        // console.log(hasil);
        // res.status(200).json(hasil);
        let data = hasil.map((val) => {
          // console.log(val);
          return {
            nopeg: val.nopeg,
            nama: val.nama_karyawan,
            jabatan: val.jabatan,
            hari_masuk: val.hari_masuk,
            tanggal_masuk: val.tgl_masuk,
            jam_masuk: val.jam_masuk,
            hari_pulang: val.hari_pulang,
            tanggal_pulang: val.tgl_pulang,
            jam_pulang: val.jam_keluar,
            keterangan: val.keterangan,
            deskripsi: val.deskripsi,
          };
        });
        const sheetAbsen = XLSX.utils.json_to_sheet(data, {
          header: [
            "nopeg",
            "nama",
            "jabatan",
            "hari_masuk",
            "tanggal_masuk",
            "jam_masuk",
            "hari_pulang",
            "tanggal_pulang",
            "jam_pulang",
            "keterangan",
            "deskripsi",
          ],
        });
        const sheetAbsenCols = [
          { wpx: 100 }, //nopeg
          { wpx: 150 }, //nama
          { wpx: 150 }, //jabatan
          { wpx: 100 }, //hari_masuk
          { wpx: 100 }, //tanggal_masuk
          { wpx: 100 }, //jam_masuk
          { wpx: 100 }, //hari_pulang
          { wpx: 100 }, //tanggal_pulang
          { wpx: 100 }, //jam_pulang
          { wpx: 100 }, //keterangan
          { wpx: 100 }, //keterangan
        ];
        sheetAbsen["!cols"] = sheetAbsenCols;
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          wb,
          sheetAbsen,
          `Absensi_${dari}_${sampai}`
        );
        XLSX.writeFile(wb, "Absensi.xlsx");
        let pathFile = path.join(__dirname, "../../Absensi.xlsx");
        res.sendFile(pathFile);
      })
      .catch((err) => {
        // console.log(err);
      });
  }

  static getGrafikAbsensi(req, res, next) {
    let { dari, sampai } = req.query;
    Axios.get(
      `https://backoffice.bapguard.com/api/grafikjti?dari=${dari}&sampai=${sampai}&departemen=ifm`
    )
      // Axios.get(
      //   `http://192.168.100.24/bap/public/api/grafikjti?dari=${dari}&sampai=${sampai}&departemen=ifm`
      // )
      .then(async (response) => {
        // console.log(response.data);
        // console.log(res.status(200));
        res.status(200).json(response.data);
      })
      .catch((err) => {
        // console.log(err);
      });
    // let { dari, sampai } = req.query;

    // let tglMulai = new Date(Number(dari));
    // let tglSelesai = new Date(Number(sampai));
    // AbsenKaryawan.find({
    //   $and: [{ tanggal: { $lt: tglSelesai } }, { tanggal: { $gt: tglMulai } }],
    // })
    //   .then((respon) => {
    //     let Output = [
    //       {
    //         nama: "Absensi Karyawan",
    //         Masuk: 0,
    //         Ijin: 0,
    //         Absen: 0,
    //       },
    //     ];

    //     respon.forEach((val) => {
    //       if (val.keterangan == "Masuk") {
    //         Output[0]["Masuk"]++;
    //       } else if (val.keterangan == "Ijin") {
    //         Output[0]["Ijin"]++;
    //       } else {
    //         Output[0]["Absen"]++;
    //       }
    //     });
    //     let pencapaian =
    //       ((Output[0]["Masuk"] + Output[0]["Ijin"]) / respon.length) * 100;
    //     res.status(200).json({
    //       data: Output,
    // pencapaian: respon.length ? Math.ceil(pencapaian) : 0,
    //       target: 100,
    //     });
    //   })
    //   .catch(next);
  }

  static deleteTraining(req, res, next) {
    let { trainingId } = req.body;
    Training.deleteOne({ _id: trainingId })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Jadwal training berhasil dihapus!" });
      })
      .catch(next);
  }

  static updateStatusCheckout(req, res, next) {
    const today = moment().utcOffset(7).startOf("day");
    JadwalPatroli.find({
      eventDate: {
        $gte: today.toDate(),
        $lte: moment(today).utcOffset(7).endOf("day").toDate(),
      },
    })
      .then((respon) => {
        if (respon.length == 0) {
          Axios.get(`https://backoffice.bapguard.com/api/auto_out`)
            .then((response) => {
              res
                .status(200)
                .json({ status: 200, message: "Data berhasil diupdate" });
            })
            .catch(next);
        } else {
          console.log("Hari Libur Jam 23.00");
        }
      })
      .catch(next);
  }

  static getAllEvent(req, res, next) {
    let project = [];
    let date = new Date().getTime();
    Project.aggregate([
      {
        $match: {
          status: "Received",
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
        $sort: { createdAt: -1 },
      },
    ])
      .then((response) => {
        response.map((val) => {
          // console.log(val);
          if (
            new Date(val.startDate).getTime() < date &&
            new Date(val.deadlineDate).getTime() > date
          ) {
            project.push({
              ...val,
              kategori: "Project",
              judul: val.title,
              backgroundColor: "#2ffa87",
              textColor: "#000000",
              indikator: "P",
            });
          }
        });
        return Training.aggregate([
          {
            $match: {
              status: "Received",
            },
          },
          {
            $sort: { startDate: -1 },
          },
        ]).then((response) => {
          response.map((val) => {
            if (
              new Date(val.startDate).getTime() < date &&
              new Date(val.deadlineDate).getTime() > date
            ) {
              project.push({
                ...val,
                kategori: "Training",
                judul: val.jenisTraining,
                backgroundColor: "#343bfa",
                textColor: "#ffffff",
                indikator: "T",
              });
            }
          });

          return Pembinaan.aggregate([
            {
              $match: {
                status: "Received",
              },
            },
            {
              $sort: { startDate: -1 },
            },
          ]).then((response) => {
            response.map((val) => {
              if (
                new Date(val.startDate).getTime() < date &&
                new Date(val.deadlineDate).getTime() > date
              ) {
                project.push({
                  ...val,
                  kategori: "Mentoring",
                  judul: val.jenisPelanggaran,
                  backgroundColor: "#fc03fc",
                  textColor: "#ffffff",
                  indikator: "M",
                });
              }
            });
            return KunjunganPest.aggregate([
              {
                $match: {
                  status: "Received",
                },
              },
              {
                $sort: { startDate: -1 },
              },
            ]).then((response) => {
              response.map((val) => {
                if (
                  new Date(val.startDate).getTime() < date &&
                  new Date(val.deadlineDate).getTime() > date
                ) {
                  project.push({
                    ...val,
                    kategori: "Treatment Pest",
                    judul: val.jenisVisit,
                    backgroundColor: "#faae34",
                    textColor: "#ffffff",
                    indikator: "TP",
                  });
                }
              });

              return VisitIndustrialIssue.aggregate([
                {
                  $match: {
                    status: "On Progress",
                  },
                },
                {
                  $sort: { startDate: -1 },
                },
              ]).then((response) => {
                response.map((val) => {
                  if (
                    new Date(val.startDate).getTime() < date &&
                    new Date(val.deadlineDate).getTime() > date
                  ) {
                    project.push({
                      ...val,
                      kategori: "Visit Industrial Issue",
                      judul: val.jenisVisit,
                      backgroundColor: "#34faed",
                      textColor: "#000000",
                      indikator: "VI",
                    });
                  }
                });
                res.status(200).json(project);
              });
            });
          });
        });
      })
      .catch(next);
  }

  static getAllEventCalendar(req, res, next) {
    let project = [];
    Project.aggregate([
      {
        $match: {
          status: "Received",
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
        $sort: { createdAt: -1 },
      },
    ])
      .then((response) => {
        response.map((val) => {
          // console.log(val);

          project.push({
            ...val,
            title: val.title,
            start: val.startDate,
            end: val.deadlineDate,
            allDay: true,
            kategori: "Project",
            color: "#2ffa87",
            text: "#000000",
            indikator: "P",
          });
        });
        return Training.aggregate([
          {
            $match: {
              status: "Received",
            },
          },
          {
            $sort: { startDate: -1 },
          },
        ]).then((response) => {
          response.map((val) => {
            project.push({
              ...val,
              title: val.jenisTraining,
              start: val.startDate,
              end: val.deadlineDate,
              allDay: true,
              kategori: "Training",
              color: "#343bfa",
              text: "#ffffff",
              indikator: "T",
            });
          });

          return Pembinaan.aggregate([
            {
              $match: {
                status: "Received",
              },
            },
            {
              $sort: { startDate: -1 },
            },
          ]).then((response) => {
            response.map((val) => {
              project.push({
                ...val,
                title: val.jenisPelanggaran,
                start: val.startDate,
                end: val.deadlineDate,
                allDay: true,
                kategori: "Mentoring",
                color: "#fc03fc",
                text: "#ffffff",
                indikator: "M",
              });
            });
            return KunjunganPest.aggregate([
              {
                $match: {
                  status: "Received",
                },
              },
              {
                $sort: { startDate: -1 },
              },
            ]).then((response) => {
              response.map((val) => {
                project.push({
                  ...val,
                  title: val.jenisVisit,
                  start: val.startDate,
                  end: val.deadlineDate,
                  allDay: true,
                  kategori: "Treatment Pest",
                  color: "#faae34",
                  text: "#ffffff",
                  indikator: "TP",
                });
              });

              return VisitIndustrialIssue.aggregate([
                {
                  $match: {
                    status: "On Progress",
                  },
                },
                {
                  $sort: { startDate: -1 },
                },
              ]).then((response) => {
                response.map((val) => {
                  project.push({
                    ...val,
                    title: val.jenisVisit,
                    start: val.startDate,
                    end: val.deadlineDate,
                    allDay: true,
                    kategori: "Visit Industrial Issue",
                    color: "#34faed",
                    text: "#000000",
                    indikator: "VI",
                  });
                });
                res.status(200).json(project);
              });
            });
          });
        });
      })
      .catch(next);
  }

  static setJumlahKaryawanMasuk(req, res, next) {
    let { tgl, jumlah } = req.body;
    // console.log(tgl, jumlah);
    Axios.post(
      `https://backoffice.bapguard.com/api/seting_karyawan`,
      // `http://192.168.100.24/bap/public/api/seting_karyawan`,
      {
        tgl: tgl,
        jumlah: jumlah,
      }
    )

      .then(async (response) => {
        res.status(200).json(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getJumlahKaryawanMasuk(req, res, next) {
    Axios.get(
      `https://backoffice.bapguard.com/api/seting_karyawan`
      // `http://192.168.100.24/bap/public/api/seting_karyawan`
    )

      .then(async (response) => {
        res.status(200).json(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // On Progress
  // static getAllDataKunjunganNull(req, res, next) {
  //   LaporanKebersihan.updateMany(
  //     {
  //       status: null,
  //     },
  //     {
  //       status: "Telah Dikunjungi",
  //     }
  //   )
  //     .then((respon) => {
  //       res.status(200).json({ respon });
  //     })
  //     .catch(next);
  // }
}

module.exports = Controller;
