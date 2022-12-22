const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
    },
    noHp: {
      type: String,
    },
    deskripsi: {
      type: String,
    },
    status: {
      type: String,
      enum: ["On Progress", "Done", "B&U", "Project"],
      default: "On Progress",
    },
    dokumentasiAwalArr: [String],
    dokumentasiAkhirArr: [String],
    progress: [
      {
        title: String,
        deskripsi: String,
        date: Date,
      },
    ],
    responDate: {
      type: Date,
    },
    deadlineDate: {
      type: Date,
    },
    solvedDate: {
      type: Date,
    },
    ruangan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ruangan",
    },
    gedung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gedung",
    },
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("Keluhan", schema);
module.exports = schemaVar;
