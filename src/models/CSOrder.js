const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama pemesan harus di isi!"],
    },
    // kategori: {
    //   type: String,
    //   required: [true, "Kategori pesanan harus di isi!"],
    // },
    kode: {
      type: String,
      required: [true, "Kode pesanan harus di isi!"],
    },
    status: {
      type: String,
      default: "Progress",
      enum: ["Progress", "Delivery Process", "Received"],
    },
    history: [
      {
        status: String,
        date: Date,
      },
    ],
    deadlineDate: Date,
    arrivedDate: Date,
    solvedInTime: Boolean,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CSOrder", schema);
module.exports = schemaVar;
