const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    diajukanOleh: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    jenisVisit: {
      type: String,
      required: [true, "Jenis Visit harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi visit harus di isi!"],
    },
    keterangan: {
      type: String,
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
      required: [true, "Tanggal visit harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai training harus di isi!"],
    },
    buktiSelesai: [String],
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("VisitIndustrialIssue", schema);
module.exports = schemaVar;
