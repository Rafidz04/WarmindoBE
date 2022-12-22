const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    idStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CSStock",
    },
    idOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CSOrder",
    },
    hargaSatuan: {
      type: Number,
      // required: [true, "Harga harus diisi"],
    },
    Qty: {
      type: Number,
      required: [true, "Jumlah unit harus di isi!"],
    },
    totalHarga: {
      type: Number,
      // required: [true, "Harga harus diisi"],
    },
    statusBarang: {
      type: String,
      default: "Progress",
      enum: ["Progress", "Delivery Process", "Received"],
    },
    deadlineDate: Date,
    arrivedDate: Date,
    deliverDate: Date,
    solvedInTime: Boolean,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CSOrderStock", schema);
module.exports = schemaVar;
