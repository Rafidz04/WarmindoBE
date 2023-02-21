const mongoose = require("mongoose");
const { hashPass } = require("../helpers/hashPass");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Username harus di isi!"],
    },
    nama: {
      type: String,
      required: [true, "Nama user harus di isi!"],
    },
    password: {
      type: String,
      required: [true, "Password harus di isi!"],
    },
    status: {
      type: String,
      default: "Aktif",
    },
    role: {
      type: Number,
      required: [true, "Role user harus di isi!"],
    },
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

const userWarmindo = mongoose.model("UserWarmindo", userSchema);
module.exports = userWarmindo;
