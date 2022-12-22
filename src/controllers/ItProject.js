const ItProject = require("../models/ItProject");
const path = require("path");

class Controller {
  static ajukanProjectIT(req, res, next) {
    let { nama } = req.decoded;
    let { judulProject, deskripsi, startDate, deadlineDate } = req.body;
    ItProject.create({
      diajukanOleh: nama,
      judulProject,
      deskripsi,
      startDate,
      deadlineDate,
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan project berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responProjectIT(req, res, next) {
    let { nama } = req.decoded;
    let { projectId, respon } = req.body;
    let project;
    let date = new Date();
    ItProject.findById(projectId)
      .then((response) => {
        project = response;
        project.diresponOleh = nama;
        if (respon === "Done") {
          if (respon === "Done") {
            if (project.status === "Done") {
              throw {
                message:
                  "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
                status: 400,
              };
            }
          }
          project.solvedDate = date;
          let dateLama = new Date(project.deadlineDate);
          // dateLama.setHours(24, 0, 0, 0);
          var diff = (date - dateLama) / 3600000;
          project.solvedInTime = diff <= 24 ? true : false;
          project.buktiSelesai = req.body.foto;
        }
        project.status = respon;
        return project.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, project berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static ajukanProjectITUlang(req, res, next) {
    let { nama } = req.decoded;
    let { projectId, startDate, deadlineDate } = req.body;
    let project;
    ItProject.findById(projectId)
      .then((response) => {
        if (response.status === "Done") {
          throw { message: "Maaf kunjungan tidak dapat diajukan ulang!" };
        } else {
          project = response;
          project.diajukanOleh = nama;
          project.startDate = startDate;
          project.deadlineDate = deadlineDate;
          return project.save();
        }
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, kunjungan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getProjectITAll(req, res, next) {
    ItProject.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getProjectITByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    ItProject.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getItGrafik(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    ItProject.find({
      $or: [{ status: "On Progress" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "IT Program",
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
