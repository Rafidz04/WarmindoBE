const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    diajukanOleh: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    diresponOleh: {
      type: String,
    },
    jenisIssue: {
      type: String,
      required: [true, "Jenis issue harus di isi!"],
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
      required: [true, "Tanggal issue harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai issue harus di isi!"],
    },
    buktiSelesai: [String],
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("ResponIndustrial", schema);
module.exports = schemaVar;
