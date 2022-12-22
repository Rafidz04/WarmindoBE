const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    namaPelanggar: {
      type: String,
      required: [true, "Nama Pelanggar harus di isi!"],
    },
    jabatan: {
      type: String,
      required: [true, "Jabatan harus di isi!"],
    },
    noHp: {
      type: String,
      required: [true, "No Hp harus di isi!"],
    },
    diajukanOleh: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    diresponOleh: {
      type: String,
    },
    jenisPelanggaran: {
      type: String,
      required: [true, "Jenis Pelanggaran harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi pembinaan harus di isi!"],
    },
    alasan: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Waiting for Approval", "Received", "Rejected", "Done"],
      default: "Waiting for Approval",
    },
    kategori: {
      type: String,
      enum: ["Verbal Rebuke", "Written Warning", "SP1", "SP2", "SP3", "PHK"],
    },
    solvedDate: {
      type: Date,
    },
    solvedInTime: {
      type: Boolean,
    },
    startDate: {
      type: Date,
      required: [true, "Tanggal pembinaan harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai pembinaan harus di isi!"],
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

const schemaVar = mongoose.model("Pembinaan", schema);
module.exports = schemaVar;
