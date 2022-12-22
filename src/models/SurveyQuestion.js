const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    urutan: {
      type: Number,
      default: 0,
    },
    pertanyaan: {
      type: String,
    },
    jenis: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("SurveyQuestion", schema);
module.exports = schemaVar;
