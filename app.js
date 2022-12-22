require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const router = require("./src/routers/index");
const PORT = process.env.PORT;
const app = express();

const server = require("http").Server(app);
require("./db.connect")();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: "PHP 7.4.11" }));

app.use("/warmindofoto", express.static("./imageLaporan"));

app.use("/", router);

app.use(require("./src/middlewares/errHandlers"));

server.listen(PORT, () => {
  console.log(`Current PORT: ${PORT}`);
});
