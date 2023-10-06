const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const Tinhtoan = require("./models/tinhtoan.js");
const Buocxa = require("./models/buocxa.js");
const Hochua = require("./models/hochua.js");
const reader = require("xlsx");
const { ObjectId } = require("mongodb");
const tinhtoan = require("./models/tinhtoan.js");
require("dotenv").config();

const app = express();

var http = require("http").createServer(app);
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static('public'));
app.set("view engine", "ejs");

//--------------
app.post("/tinhtoan/create", async (req, res) => {
  let data = new Tinhtoan({
    nuoctruoc: req.body.wbefore,
    dungtichtruoc: req.body.capbefore,
    nuocsau: req.body.wafter,
    dungtichsau: req.body.capafter,
    qmay: req.body.qrun,
    qxa: req.body.qdis,
    qho: req.body.qlake,
    timeday: req.body.timeday,
    timehour: req.body.timehour,
    });
  data.save();
  res.redirect("/");
});

app.get("/", async (req, res, next) => {
  const data = await Tinhtoan.find({});
  res.render("table_tinhtoan", { table: data });
});

app.get("/add", async (req, res) => {
  const data = await Hochua.find({})
  res.render("form_add",{hochua:data});
});

app.get("/:id", async (req, res) => {
  const data = await Tinhtoan.findById({_id:req.params.id})
  res.render("form_edit",{data:data});
});

app.post("/update/:id", async (req, res) => {
  const data = await Tinhtoan.findByIdAndUpdate(req.params.id,{
    nuoctruoc: req.body.wbefore,
    dungtichtruoc: req.body.capbefore,
    nuocsau: req.body.wafter,
    dungtichsau: req.body.capafter,
    qmay: req.body.qrun,
    qxa: req.body.qdis,
    qho: req.body.qlake,
    timeday: req.body.timeday,
    timehour: req.body.timehour,
  })
  data.save()
  res.redirect("/")
})
app.get('/delete/:id', async (req, res) => {
  const del = await Tinhtoan.findByIdAndDelete(req.params.id)
  res.redirect("/")
});
//--------------
app.get("/buocxa", async (req, res, next) => {
  const data = await Buocxa.find({});
  res.render("table_buocxa", { table: data });
});
app.post("/buocxa/add", async (req, res) => {
  await Buocxa.create(req.body);
  data.save();
  res.json("success");
});
//--------------

app.get("/get", async (req, res) => {
  const file = reader.readFile("hochua.xlsx");
  let data = [];
  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res);
    });
  }

  res.json(data);
});

app.get("/hochua", async (req, res) => {
  const data = await Hochua.find({});
  res.render("table_hochua", { table: data });
});

app.post("/click", async (req, res) => {
    const data = await Hochua.find({mnh:req?.body?.value})
    const obj = data.reduce((accumulator, data) => {
        return {...accumulator, 'val': data.dungtich};
      }, {});

    return res.status(200).json({
        data: obj
      });
})

app.post("/hochua/add", async (req, res) => {
    await Hochua.create(req.body)
    res.json("success");
  });

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect DB Success"))
  .catch((err) => console.error(err));

http.listen(port, () => console.log(`http://localhost:${port}`));
