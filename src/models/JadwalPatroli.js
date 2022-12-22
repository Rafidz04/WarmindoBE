const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    namaAcara: {
      type: String,
    },
    idCalendarPatroli: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CalendarPatroli",
    },
    eventDate: Date,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("JadwalPatroli", schema);
module.exports = schemaVar;
