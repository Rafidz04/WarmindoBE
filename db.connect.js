var mongoose = require("mongoose");

const dbConnect = () => {
  const mongoURI = process.env.MONGO_URL;
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    connectTimeoutMS: 15000,
  });
  let db = mongoose.connection;
  db.on("error", console.log.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("MONGODB CONNECT");
  });
};

module.exports = dbConnect;
