const mongoose = require("mongoose");
const { hashPass } = require("../helpers/hashPass");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Nama user harus di isi!"],
    },
    password: {
      type: String,
      required: [true, "Password harus di isi!"],
    },
    perusahaan: {
      type: String,
      required: [true, "Nama Perusahaan harus di isi!"],
    },
    cabang: {
      type: String,
      required: [true, "Nama Cabang harus di isi!"],
    },
    menu: [String],
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

userSchema.pre("save", function (next) {
  let newPass = hashPass(this.password);
  this.password = newPass;
  next();
});

const user = mongoose.model("User", userSchema);
module.exports = user;
