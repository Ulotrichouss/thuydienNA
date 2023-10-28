const Tinhtoan = require("../models/tinhtoan.js");
const Buocxa = require("../models/buocxa.js");
const Hochua = require("../models/hochua.js");
const Sanluong = require("../models/sanluong.js");
const reader = require("xlsx");
const excelJS = require("exceljs");

module.exports = {
  getMain: async (req, res) => {
    
    res.render("bieudo")
  },

  getBuocxa: async (req, res) => {
    const data = await Buocxa.find({}).sort({ buoc: 1 });
    res.render("table_buocxa", { table: data });
  },

  getSanluong: async (req, res) => {
    const data = await Sanluong.find({});
    res.render("table_sanluong", { table: data });
  },

  getTinhtoan: async (req, res) => {
    const data = await Tinhtoan.find({});
    res.render("table_tinhtoan", { table: data });
  },

  getAddTT: async (req, res) => {
    res.render("form_addTT");
  },

  getAddSL: async (req, res) => {
    res.render("form_addSL");
  },

  getEditTT: async (req, res) => {
    const data = await Tinhtoan.findById({ _id: req.params.id });
    res.render("form_editTT", { data: data });
  },

  getEditSL: async (req, res) => {
    const data = await Sanluong.findById({ _id: req.params.id });
    res.render("form_editSL", { data: data });
  },

  postUpdateTT: async (req, res) => {
    const data = await Tinhtoan.findByIdAndUpdate(req.params.id, {
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
  },

  postUpdateSL: async (req, res) => {
    const data = await Sanluong.findByIdAndUpdate(req.params.id, {
      congsuat: req.body.congsuat,
      giadien: req.body.giadien,
      tongtien: req.body.congsuat * req.body.giadien * 1000,
    });
    data.save();
    res.redirect("/sanluong");
  },

  postCreateTT: async (req, res) => {
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
  },

  postCreateHC: async (req, res) => {
    await Hochua.create(req.body);
    res.json("success");
  },

  postCreateBX: async (req, res) => {
    await Buocxa.create(req.body);
    res.json("success");
  },

  postCreateSL: async (req, res) => {
    let datetime = new Date().toISOString().slice(0, 10);
    let check = await Sanluong.find({ datetime });
    if (Object.keys(check).length > 0) {
      let data = new Sanluong({
        time: datetime,
        congsuat: req.body.congsuat,
        giadien: req.body.giadien,
        tongtien: req.body.congsuat * req.body.giadien * 1000
      });
      data.save();
    } else {
      let data = await Sanluong.findOneAndUpdate(
        { time: datetime },
        { congsuat: req?.body?.congsuat, giadien: req?.body?.giadien },
        { new: true, upsert: true }
      );
    }
    res.redirect("/sanluong");
  },

  getDeleteTT: async (req, res) => {
    const del = await Tinhtoan.findByIdAndDelete(req.params.id);
    res.redirect("/");
  },

  getDeleteSL: async (req, res) => {
    const del = await Sanluong.findByIdAndDelete(req.params.id);
    res.redirect("/sanluong");
  },

  getFile: async (req, res) => {
    try {
      const file = await reader.readFile("buocxa.xlsx");
      let data = [];
      const sheets = file.SheetNames;

      for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[i]]
        );
        temp.forEach((res) => {
          data.push(res);
        });
      }

      res.json(data);
    } catch (err) {
      res.json(err);
    }
  },

  getClick: async (req, res) => {
    if (Number.isInteger(Number(req?.body?.value))) {
      const value = Number(req?.body?.value).toFixed(2).toString();
      const data = await Hochua.find({ mnh: value });
      const obj = data.reduce((accumulator, data) => {
        return { ...accumulator, val: data.dungtich };
      }, {});

      return res.json({
        data: obj,
      });
    } else {
      const data = await Hochua.find({ mnh: req?.body?.value });
      const obj = data.reduce((accumulator, data) => {
        return { ...accumulator, val: data.dungtich };
      }, {});

      return res.json({
        data: obj,
      });
    }
  },

  getExportAllSL: async (req, res) => {
    try {
      const data = await Sanluong.find({});
      let dt = [];
      data.forEach((element) => {
        const { congsuat, giadien, tongtien, time } = element;
        dt.push({ time, congsuat, giadien, tongtien });
      });
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = [
        { header: "Thời gian", key: "time", width: 15 },
        { header: "Công suất phát P (MW)", key: "congsuat", width: 10 },
        { header: "Giá điện (VNĐ)", key: "giadien", width: 15 },
        { header: "Thành tiền", key: "tongtien", width: 20 },
      ];

      dt.forEach((form) => {
        worksheet.addRow(form);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "DataSL.xlsx"
      );

      workbook.xlsx.write(res).then(() => res.end());
    } catch (err) {
      return res.json(err);
    }
  },

  getExportAllTT: async (req, res) => {
    try {
      const data = await Tinhtoan.find({});
      let dt = [];
      data.forEach((value) => {
        const { nuoctruoc,dungtichtruoc, nuocsau, dungtichsau, qmay, qxa, qho, timeday, timehour } = value;
        dt.push({ nuoctruoc, dungtichtruoc, nuocsau, dungtichsau, qho, qmay, qxa, timehour, timeday });
      });
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = [
        { header: "Mực nước hồ trước", key: "nuoctruoc", width: 15 },
        { header: "Dung tích hồ trước", key: "dungtichtruoc", width: 15 },
        { header: "Mực nước sau", key: "nuocsau", width: 15 },
        { header: "Dung tích hồ trước", key: "dungtichsau", width: 15 },
        { header: "Q về hồ (m3/s)", key: "qho", width: 15 },
        { header: "Q chạy máy (m3/s)", key: "qmay", width: 15 },
        { header: "Q xả (m3/s)", key: "qxa", width: 15 },
        { header: "Thời gian đầy hồ (giờ)", key: "timehour", width: 15 },
        { header: "Thời gian đầy hồ (ngày)", key: "timeday", width: 15 },
      ];

      dt.forEach((form) => {
        worksheet.addRow(form);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "DataTT.xlsx"
      );

      workbook.xlsx.write(res).then(() => res.end());
    } catch (err) {
      return res.json(err);
    }
  },

  getExportTimeTT: async (req, res) => {
    try {
      const data = await Tinhtoan.find({});
      let dt = [];
      data.forEach((value) => {
        const { nuoctruoc,dungtichtruoc, nuocsau, dungtichsau, qmay, qxa, qho, timeday, timehour } = value;
        dt.push({ nuoctruoc, dungtichtruoc, nuocsau, dungtichsau, qho, qmay, qxa, timehour, timeday });
      });
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = [
        { header: "Mực nước hồ trước", key: "nuoctruoc", width: 15 },
        { header: "Dung tích hồ trước", key: "dungtichtruoc", width: 15 },
        { header: "Mực nước sau", key: "nuocsau", width: 15 },
        { header: "Dung tích hồ trước", key: "dungtichsau", width: 15 },
        { header: "Q về hồ (m3/s)", key: "qho", width: 15 },
        { header: "Q chạy máy (m3/s)", key: "qmay", width: 15 },
        { header: "Q xả (m3/s)", key: "qxa", width: 15 },
        { header: "Thời gian đầy hồ (giờ)", key: "timehour", width: 15 },
        { header: "Thời gian đầy hồ (ngày)", key: "timeday", width: 15 },
      ];

      dt.forEach((form) => {
        worksheet.addRow(form);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "DataTT.xlsx"
      );

      workbook.xlsx.write(res).then(() => res.end());
    } catch (err) {
      return res.json(err);
    }
  },

  getDownloadSL: async (req, res) => {
      const data = await Sanluong.find({"time":{$gte:req?.body?.dateStart, $lt:req?.body?.dateEnd}})
      let dt = [];
      data.forEach((value) => {
        const { time,congsuat, giadien, tongtien } = value;
        dt.push({ time,congsuat, giadien, tongtien });
      });
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = [
        { header: "Thời gian", key: "time", width: 15 },
        { header: "Công suất", key: "congsuat", width: 15 },
        { header: "Giá điện", key: "giadien", width: 15 },
        { header: "Tổng tiền", key: "tongtien", width: 15 }
      ];

      dt.forEach((form) => {
        worksheet.addRow(form);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "Download.xlsx"
      );

      return workbook.xlsx.write(res).then(() => res.end())
  },

  getFetchData: async (req, res) => {
    const arrTime = [],
          arrData = []
    const data = await Sanluong.find({})
    // Object.keys(data).forEach( function(key) {
    //   arrTime.push(data[key].time)
    //   arrData.push(data[key].tongtien)
    // })
    return res.json(data)
  }
};
