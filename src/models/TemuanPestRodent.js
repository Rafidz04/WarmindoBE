const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    gedung: {
      type: String,
      required: [true, "Gedung harus di isi!"],
    },
    area: {
      type: String,
      required: [true, "Area harus di isi!"],
    },
    diajukanOleh: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    diresponOleh: {
      type: String,
    },
    jenisTemuan: {
      type: String,
      required: [true, "Jenis temuan harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi temuan harus di isi!"],
    },
    status: {
      type: String,
      enum: ["On Progress", "Done"],
      default: "On Progress",
    },
    solvedDate: {
      type: Date,
    },
    solvedInTime: {
      type: Boolean,
    },
    startDate: {
      type: Date,
      required: [true, "Tanggal temuan harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai training harus di isi!"],
    },
    dokumentasiAwalArr: [String],
    dokumentasiAkhirArr: [String],
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("TemuanPestRodent", schema);
module.exports = schemaVar;
