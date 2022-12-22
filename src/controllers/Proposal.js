const Proposal = require("../models/Proposal");
const KategoryProposal = require("../models/KategoryProposal");
class Controller {
  static addKategory(req, res, next) {
    let { kategory } = req.body;
    KategoryProposal.create({ kategory })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Kategory berhasil didaftarkan!" });
      })
      .catch(next);
  }

  static getKategory(req, res, next) {
    KategoryProposal.find({})
      .sort({ kategory: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static deleteKategory(req, res, next) {
    let { idKategory } = req.body;
    KategoryProposal.deleteOne({ _id: idKategory })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Kategory berhasil dihapus!" });
      })
      .catch(next);
  }
  static tambahkanProposal(req, res, next) {
    let { judul, kategory, deskripsi } = req.body;
    Proposal.create({ judul, kategory, deskripsi })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Proposal berhasil diajukan!" });
      })
      .catch(next);
  }
  static getProposal(req, res, next) {
    Proposal.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static responProposal(req, res, next) {
    let { idProposal, status } = req.body;
    Proposal.findOne({ _id: idProposal })
      .then((response) => {
        if (response.status !== "Waiting for Approval") {
          throw { status: 400, message: "Maaf, proposal sudah direspon!" };
        } else {
          return Proposal.updateOne({ _id: idProposal }, { status });
        }
      })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: "Proposal berhasil direspon!" });
      })
      .catch(next);
  }
}

module.exports = Controller;
