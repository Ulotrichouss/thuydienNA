const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const route = require('./routes/main.js');
const cron = require('node-cron');
const axios = require('axios');
require("dotenv").config();

const app = express();

var http = require("http").createServer(app);
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");

app.use(route);

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect DB Success"))
  .catch((err) => console.error(err))

async function fetchDataJob() {
  try {
    const response = await axios.get('http://127.0.0.1:3000/checktime')
  } catch (error) {
    console.error('Error:', error.message);
  }
};

cron.schedule('0 0 * * *', async () => {
  fetchDataJob();
}, {
  scheduled: true,
  start: true,
  timezone: 'Asia/Ho_Chi_Minh'
});

http.listen(port, () => console.log(`http://127.0.0.1:${port}`));
