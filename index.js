const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const route = require('./routes/main.js');
require("dotenv").config();

const app = express();

var http = require("http").createServer(app);
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(route);

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect DB Success"))
  .catch((err) => console.error(err))

http.listen(port, () => console.log(`http://localhost:${port}`));
