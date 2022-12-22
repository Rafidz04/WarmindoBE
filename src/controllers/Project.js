const ProjectKategory = require("../models/ProjectKategory");
const Project = require("../models/Project");
const Gedung = require("../models/Gedung");
const path = require("path");

class Controller {
  static daftarProjectKategory(req, res, next) {
    let { jenis } = req.body;

    ProjectKategory.create({ jenis })
      .then((response) => {
        res
          .status(200)
          .json({ message: "Project Kategory berhasil ditambahkan" });
      })
      .catch(next);
  }
  static getProjectKategory(req, res, next) {
    ProjectKategory.find({})
      .sort({ jenis: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static downloadDokumen(req, res, next) {
    let { file } = req.query;
    let pathFile = path.join(__dirname, `../../FileProject/${file}`);
    res.sendFile(pathFile);
  }

  static ajukanProject(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { category, title, deskripsi, startDate, deadlineDate } = req.body;

    Project.create({
      diajukanOleh: nama,
      category,
      title,
      deskripsi,
      startDate,
      deadlineDate,
      filePendukung: req.body.dokumen,
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan project berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static ajukanUlang(req, res, next) {
    let { nama } = req.decoded;
    let { projectId, dariTgl, smpTgl } = req.body;
    let project;
    Project.findById(projectId)
      .then((response) => {
        if (response.status === "Received" || response.status === "Done") {
          throw { message: "Maaf project tidak dapat diajukan ulang!" };
        } else {
          project = response;
          project.status = "Waiting for Approval";
          project.diajukanOleh = nama;
          project.diresponOleh = "";
          project.alasan = "";
          project.startDate = new Date(Number(dariTgl));
          project.deadlineDate = new Date(Number(smpTgl));
          return project.save();
        }
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, project berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static responProject(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { projectId, respon, alasan, keterangan } = req.body;
    let project;
    let date = new Date();
    Project.findById(projectId)
      .then((response) => {
        project = response;
        project.diresponOleh = nama;
        if (respon === "Received") {
          if (project.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          project.alasan = "";
        } else if (respon === "Rejected") {
          if (project.status !== "Waiting for Approval") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
          project.alasan = alasan;
        } else if (respon === "Done") {
          if (project.status === "Waiting for Approval") {
            throw { message: "Maaf, project belum disetujui!", status: 400 };
          } else if (project.status === "Rejected") {
            throw {
              message: "Maaf, project ditolak dan tidak dapat diselesaikan!",
              status: 400,
            };
          }
          project.alasan = "";
          project.solvedDate = date;
          project.keterangan = keterangan;
          let dateLama = new Date(project.deadlineDate);
          dateLama.setHours(24, 0, 0, 0);
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

  static getprojectall(req, res, next) {
    Project.aggregate([
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

  static getprojectstatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    Project.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getprojectstatusgroup(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query.status = status;
    Gedung.find({})
      .sort({ gedung: 1 })
      .then((response) => {
        let facets = {};
        response.forEach((val, index) => {
          facets[val.gedung] = [
            {
              $match: {
                gedung: val._id,
                ...query,
              },
            },
            {
              $sort: { updatedAt: -1 },
            },
          ];
        });
        return Project.aggregate([
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

  static getprojectgrafik(req, res, next) {
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
                $or: [
                  { status: "Waiting for Approval" },
                  { status: "Received" },
                  { status: "Done" },
                ],
              },
            },
          ];
        });
        return Project.aggregate([
          {
            $facet: facets,
          },
        ]);
      })
      .then((response) => {
        let output = [];
        let solvedNotInTime = 0;
        let total = 0;
        // res.status(200).json(response);
        Object.keys(response[0]).forEach((val, index) => {
          output[index] = {
            name: val,
            "Waiting for Approval": 0,
            "On Progress": 0,
            Selesai: 0,
            OnTime: 0,
            "Not OnTime": 0,
          };
          response[0][val].forEach((val2, index2) => {
            total++;
            if (val2.status === "Done") {
              if (val2.solvedInTime) {
                output[index]["OnTime"]++;
              } else {
                solvedNotInTime++;
                output[index]["Not OnTime"]++;
              }

              // output[index]["NotIntime"]++;
            }
            if (val2.status === "Waiting for Approval") {
              output[index]["Waiting for Approval"]++;
            } else if (val2.status === "Received") {
              output[index]["On Progress"]++;
            } else if (val2.status === "Done") {
              output[index]["Done"]++;
              // output[index]["Intime"]++;
            }
          });
        });
        let pencapaian = ((total - solvedNotInTime) / total) * 100;
        res.status(200).json({
          data: output,
          pencapaian: total ? Math.ceil(pencapaian) : 100,
          target: 100,
        });
      })
      .catch(next);
  }

  static getprojectcalendar(req, res, next) {
    Project.aggregate([
      {
        $match: {
          status: "Received",
        },
      },
    ])
      .then((response) => {
        let hasil = response.map((val, index) => {
          return {
            title: val.title,
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
}

module.exports = Controller;
