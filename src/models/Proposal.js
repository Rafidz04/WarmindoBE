const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, "Judul proposal harus di isi!"],
    },
    kategory: {
      type: String,
      required: [true, "Kategori proposal harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi proposal harus di isi!"],
    },
    status: {
      type: String,
      enum: ["Waiting for Approval", "Received", "Rejected"],
      default: "Waiting for Approval",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("Proposal", schema);
module.exports = schemaVar;
