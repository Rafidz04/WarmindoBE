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
    judulProblem: {
      type: String,
      required: [true, "Judul Project harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi harus di isi!"],
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
      required: [true, "Tanggal awal harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai harus di isi!"],
    },
    buktiSelesai: [String],
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("ItHardware", schema);
module.exports = schemaVar;
