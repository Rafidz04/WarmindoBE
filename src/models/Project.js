const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    diajukanOleh: {
      type: String,
      required: [true, "Nama Area harus di isi!"],
    },
    diresponOleh: {
      type: String,
    },
    title: {
      type: String,
      required: [true, "Judul project harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi project harus di isi!"],
    },
    alasan: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Waiting for Approval", "Received", "Rejected", "Done"],
      default: "Waiting for Approval",
    },
    solvedDate: {
      type: Date,
    },
    solvedInTime: {
      type: Boolean,
    },
    filePendukung: [String],
    startDate: {
      type: Date,
      required: [true, "Tanggal mulai project harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai project harus di isi!"],
    },
    buktiSelesai: [String],
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

const schemaVar = mongoose.model("Project", schema);
module.exports = schemaVar;
