const ItHardware = require("../models/ItHardware");
const path = require("path");

class Controller {
  static ajukanProblemHardwareIT(req, res, next) {
    let { nama } = req.decoded;
    let { judulProblem, deskripsi, startDate } = req.body;
    let date = new Date();
    ItHardware.create({
      diajukanOleh: nama,
      judulProblem,
      deskripsi,
      startDate,
      deadlineDate: new Date(startDate).setHours(
        new Date(startDate).getHours() + 72
      ),
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan problem berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responProblemHardwareIT(req, res, next) {
    let { nama } = req.decoded;
    let { problemId, respon } = req.body;
    let problem;
    let date = new Date();
    ItHardware.findById(problemId)
      .then((response) => {
        problem = response;
        problem.diresponOleh = nama;
        if (respon === "Done") {
          if (respon === "Done") {
            if (problem.status === "Done") {
              throw {
                message:
                  "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
                status: 400,
              };
            }
          }
          problem.solvedDate = date;
          let dateLama = new Date(problem.deadlineDate);
          // dateLama.setHours(24, 0, 0, 0);
          var diff = (date - dateLama) / 3600000;
          problem.solvedInTime = diff <= 24 ? true : false;
          problem.buktiSelesai = req.body.foto;
        }
        problem.status = respon;
        return problem.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, problem berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getProblemHardwareITAll(req, res, next) {
    ItHardware.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getProblemHardwareITByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    ItHardware.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getProblemHardwareItGrafik(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    ItHardware.find({
      $or: [{ status: "On Progress" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "IT Problem Hardware",
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
            val.status == "On Progress" &&
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
}

module.exports = Controller;
