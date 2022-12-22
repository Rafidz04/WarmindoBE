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
    jenisVisit: {
      type: String,
      required: [true, "Jenis Visit harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi visit harus di isi!"],
    },
    alasan: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Waiting for Approval", "Received", "Rejected", "Done"],
      default: "Received",
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
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("KunjunganPestRodent", schema);
module.exports = schemaVar;
