const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    deskripsi: {
      type: String,
    },
    tindakLanjut: {
      type: String,
    },
    lembagaTerkait: {
      type: String,
    },
    dokumentasiAkhirArr: [String],
    statusSolved: {
      type: Boolean,
      default: false,
    },
    solvedDate: {
      type: Date,
    },
    solvedInTime: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("pestrodent", schema);
module.exports = schemaVar;
