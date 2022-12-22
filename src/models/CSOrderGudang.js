const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama pemesan harus di isi!"],
    },
    divisi: {
      type: String,
      required: [true, "Nama divisi harus di isi!"],
    },
    // kategori: {
    //   type: String,
    //   required: [true, "Kategori pesanan harus di isi!"],
    // },
    status: {
      type: String,
      default: "Progress",
      enum: ["Progress", "Received"],
    },
    history: [
      {
        status: String,
        date: Date,
      },
    ],
    arrivedDate: Date,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CSOrderGudang", schema);
module.exports = schemaVar;
