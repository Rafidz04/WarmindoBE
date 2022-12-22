const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    jam: [Number],
    durasi: {
      type: Number,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("Shift", schema);
module.exports = schemaVar;
