const Tinhtoan = require("../models/tinhtoan.js");
const Buocxa = require("../models/buocxa.js");
const Hochua = require("../models/hochua.js");
const Sanluong = require("../models/sanluong.js");
const Taikhoan = require("../models/taikhoan.js");
const Download = require("../models/download.js");
const reader = require("xlsx");
const excelJS = require("exceljs");

function changeTime(time) {
  let data = new Date(time)
  data.setDate(data.getDate()-1)
  return data.toISOString().slice(0,10)
}

module.exports = {
  changeTime: changeTime,

  getMain: async (req, res) => {
    const month = new Date()
    const data = await Sanluong.find({month:(month.getMonth()+1)}).sort({time:-1})
    res.render("bieudo",{getDt:data})
  },

  getBuocxa: async (req, res) => {
    const data = await Buocxa.find({}).sort({ buoc: 1 });
    res.render("table_buocxa", { table: data });
  },

  getSanluong: async (req, res) => {
    let datetime = new Date();
    datetime.setHours(datetime.getHours()+7);
    let time = datetime.toISOString().slice(0,10)
    // let check = await Sanluong.find({ time })
    // if (Object.keys(check).length == 0) {
    //   let data = new Sanluong({
    //     time: time,
    //     electric_output: "",
    //     revenue: "",
    //     tongtien: 0,
    //   });
    //   data.save();
    // }
    const data = await Sanluong.find({}).sort({time:-1})
    res.render("table_sanluong", { table: data })
  },

  getTinhtoan: async (req, res) => {
    const data = await Tinhtoan.find({});
    res.render("table_tinhtoan", { table: data });
  },

  getAccount: async (req, res) => {
    const data = await Taikhoan.find({})
    res.render('table_taikhoan',{table:data})
  },

  getDownload: async (req, res) => {
    const data = await Download.find({})
    res.render('table_download',{table:data})
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

  postUpdateRSL: async (req, res) => {
    try {
      const data = await Sanluong.findByIdAndUpdate(req.params.id,{
        revenue: req.body.revenue,
        revenue_month: req.body.revenue,
        revenue_year: req.body.revenue,
      },{ new:true, upsert:true, returnDocument:true})
      
      const findData = await Sanluong.find({time:{$gte:changeTime(data.time)},month:data.month,year:data.year}).sort({time:1})
      for(let i = 1;i < findData.length;i++) {
        const find = await Sanluong.find({time:{$gte:changeTime(data.time)},month:data.month,year:data.year}).sort({time:1})
        await Sanluong.updateOne(
          { "_id":find[i]._id },
          { $set : {
            revenue_month: Number(find[i].revenue) + Number(find[i-1].revenue_month),
            revenue_year: Number(find[i].revenue) + Number(find[i-1].revenue_year) 
          }},
          { new:true }
        )
      }

      res.redirect("/sanluong")
    } catch (error) {
      console.log(error)
    }
  },

  postUpdateESL: async (req, res) => {
    try {
      const data = await Sanluong.findByIdAndUpdate(req.params.id,{
        electric_output: req.body.electric,
        accumulated_month: req.body.electric,
        accumulated_year: req.body.electric,
      },{ new:true, upsert:true, returnDocument:true})
      
      const findData = await Sanluong.find({time:{$gte:changeTime(data.time)},month:data.month,year:data.year}).sort({time:1})
      for(let i = 1;i < findData.length;i++) {
        const find = await Sanluong.find({time:{$gte:changeTime(data.time)},month:data.month,year:data.year}).sort({time:1})
        await Sanluong.updateOne(
          { "_id":find[i]._id },
          { $set : {
            accumulated_month: Number(find[i].electric_output) + Number(find[i-1].accumulated_month),
            accumulated_year: Number(find[i].electric_output) + Number(find[i-1].accumulated_year) 
          }},
          { new:true }
        )
      }

      res.redirect("/sanluong")
    } catch (error) {
      console.log(error)
    }
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

  getDeleteTT: async (req, res) => {
    const del = await Tinhtoan.findByIdAndDelete(req.params.id);
    res.redirect("/");
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
    const data = await Sanluong.find({})
    return res.json(data)
  }
};
