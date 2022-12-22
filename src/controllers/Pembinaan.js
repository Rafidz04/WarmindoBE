const Pembinaan = require("../models/Pembinaan");
const path = require("path");

class Controller {
  static ajukanPembinaan(req, res, next) {
    let { nama } = req.decoded;
    let {
      namaPelanggar,
      jabatan,
      noHp,
      jenisPelanggaran,
      deskripsi,
      startDate,
    } = req.body;
    let date = new Date(startDate);
    Pembinaan.create({
      namaPelanggar,
      jabatan,
      noHp,
      diajukanOleh: nama,
      jenisPelanggaran,
      deskripsi,
      startDate,
      deadlineDate: date.setHours(date.getHours() + 168),
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan pembinaan berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responPembinaan(req, res, next) {
    let { nama } = req.decoded;
    let { pembinaanId, respon, alasan, kategori, keterangan } = req.body;
    let pembinaan;
    let date = new Date();
    Pembinaan.findById(pembinaanId)
      .then((response) => {
        pembinaan = response;
        pembinaan.diresponOleh = nama;
        if (respon === "Received") {
          if (pembinaan.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          pembinaan.alasan = "";
        } else if (respon === "Rejected") {
          if (pembinaan.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          pembinaan.alasan = alasan;
        } else if (respon === "Done") {
          if (pembinaan.status === "Waiting for Approval") {
            throw { message: "Maaf, pembinaan belum disetujui!", status: 400 };
          } else if (pembinaan.status === "Rejected") {
            throw {
              message: "Maaf, pembinaan ditolak dan tidak dapat diselesaikan!",
              status: 400,
            };
          }
          pembinaan.kategori = kategori;
          pembinaan.alasan = "";
          pembinaan.solvedDate = date;
          pembinaan.keterangan = keterangan;
          let dateLama = new Date(pembinaan.deadlineDate);
          // dateLama.setHours(24, 0, 0, 0);
          var diff = (date - dateLama) / 3600000;
          pembinaan.solvedInTime = diff <= 24 ? true : false;
          pembinaan.buktiSelesai = req.body.foto;
        }
        pembinaan.status = respon;
        return pembinaan.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, pembinaan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static ajukanPembinaanUlang(req, res, next) {
    let { nama } = req.decoded;
    let { pembinaanId, startDate } = req.body;
    let pembinaan;
    let date = new Date(startDate);
    Pembinaan.findById(pembinaanId)
      .then((response) => {
        if (response.status === "Received" || response.status === "Done") {
          throw { message: "Maaf project tidak dapat diajukan ulang!" };
        } else {
          pembinaan = response;
          pembinaan.status = "Waiting for Approval";
          pembinaan.diajukanOleh = nama;
          pembinaan.diresponOleh = "";
          pembinaan.alasan = "";
          pembinaan.startDate = startDate;
          pembinaan.deadlineDate = date.setHours(date.getHours() + 168);
          return pembinaan.save();
        }
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, pembinaan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getPembinaanAll(req, res, next) {
    Pembinaan.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getPembinaanByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    Pembinaan.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getTrainingAll(req, res, next) {
    Training.find({})
      .sort({ createdAt: -1 })
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

  static getGrafikPembinaan(req, res, next) {
    let { dari, sampai } = req.query;
    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    Pembinaan.find({
      $or: [{ status: "Received" }, { status: "Done" }],
      $and: [
        { startDate: { $lt: tglSelesai } },
        { startDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Mentoring Program",
            "On Time": 0,
            "Not Ontime": 0,
          },
        ];
        let kejadian = 100 - respon.length * 5;
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
          kejadian: kejadian > 0 ? kejadian : 0,
          target: 100,
        });
      })
      .catch(next);
  }
  // static getpembinaancalendar(req, res, next) {
  //   Pembinaan.aggregate([
  //     {
  //       $match: {
  //         status: "Received",
  //       },
  //     },
  //   ])
  //     .then((response) => {
  //       let hasil = response.map((val, index) => {
  //         return {
  //           title: val.title,
  //           allDay: true,
  //           start: val.startDate,
  //           end: val.deadlineDate,
  //           // color: "default",
  //         };
  //       });
  //       res.status(200).json(hasil);
  //     })
  //     .catch(next);
  // }
}

module.exports = Controller;
