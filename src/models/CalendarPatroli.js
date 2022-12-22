const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    namaAcara: {
      type: String,
    },
    startDate: Date,
    endDate: Date,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CalendarPatroli", schema);
module.exports = schemaVar;
