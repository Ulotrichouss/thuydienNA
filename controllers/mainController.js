const Tinhtoan = require("../models/tinhtoan.js");
const Buocxa = require("../models/buocxa.js");
const Hochua = require("../models/hochua.js");
const Sanluong = require("../models/sanluong.js");
const Taikhoan = require("../models/taikhoan.js");
const Download = require("../models/download.js");
const excelJS = require("exceljs");
const excel = require('excel4node');
const cron = require('node-cron');
const axios = require('axios');

function changeTime(time) {
  let data = new Date(time)
  data.setDate(data.getDate() - 1)
  return data.toISOString().slice(0, 10)
}

// const fetchDataJob = async () => {
//   try {
//     const response = await axios.get('/checktime')
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// };

// cron.schedule('* * * * *', async () => {
//   await fetchDataJob();
// }, {
//   start: true, 
//   timezone: 'Asia/Ho_Chi_Minh'
// });

module.exports = {
  changeTime: changeTime,

  getMain: async (req, res) => {
    const time = new Date()
    const data = await Sanluong.find({ time: { $gte: changeTime(time) } })
    res.render("bieudo", { data: data })
  },

  getBuocxa: async (req, res) => {
    const data = await Buocxa.find({}).sort({ buoc: 1 });
    res.render("table_buocxa", { table: data });
  },

  getSanluong: async (req, res) => {
    const data = await Sanluong.find({}).sort({ time: -1 })
    res.render("table_sanluong", { table: data })
  },

  getCheckTime: async (req, res) => {
    let acc_month,acc_year,rev_month,rev_year = 0
    let datetime = new Date();
    let timeCurrent = datetime.toISOString().slice(0,10)
    datetime.setDate(datetime.getDate()-1)
    let timeBefore = datetime.toISOString().slice(0,10)
    const data = await Sanluong.find({time:timeCurrent})
    const beforeData = await Sanluong.find({time:timeBefore})
    beforeData.map(item =>{
      acc_month = item.accumulated_month
      acc_year = item.accumulated_year
      rev_month = item.revenue_month
      rev_year = item.revenue_year
    })
    if(data.length == 0) {
      const createData = new Sanluong({
        time: timeCurrent,
        electric_output: null,
        month: datetime.getMonth()+1,
        year: datetime.getFullYear(),
        accumulated_month: acc_month,
        accumulated_year: acc_year,
        revenue: null,
        revenue_month: rev_month,
        revenue_year: rev_year,
      });
      createData.save();
      return console.log('Success')
    } 
    return console.log('Exist')
  },

  getTinhtoan: async (req, res) => {
    const data = await Tinhtoan.find({});
    res.render("table_tinhtoan", { table: data });
  },

  getAccount: async (req, res) => {
    const data = await Taikhoan.find({})
    res.render('table_taikhoan', { table: data })
  },

  getDownload: async (req, res) => {
    const data = await Download.find({})
    res.render('table_download', { table: data })
  },

  getAddTT: async (req, res) => {
    res.render("form_addTT");
  },

  getEditTT: async (req, res) => {
    const data = await Tinhtoan.findById({ _id: req.params.id });
    res.render("form_editTT", { data: data });
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
      const data = await Sanluong.findByIdAndUpdate(req.params.id, {
        revenue: req.body.revenue,
        revenue_month: req.body.revenue,
        revenue_year: req.body.revenue,
      }, { new: true, upsert: true, returnDocument: true })

      const findData = await Sanluong.find({ time: { $gte: changeTime(data.time) }, month: data.month, year: data.year })
      for (let i = 1; i < findData.length; i++) {
        const find = await Sanluong.find({ time: { $gte: changeTime(data.time) }, month: data.month, year: data.year }).sort({ time: 1 })
        await Sanluong.updateOne(
          { "_id": find[i]._id },
          {
            $set: {
              revenue_month: Number(find[i].revenue) + Number(find[i - 1].revenue_month),
              revenue_year: Number(find[i].revenue) + Number(find[i - 1].revenue_year)
            }
          },
          { new: true }
        )
      }

      res.redirect("/sanluong")
    } catch (error) {
      console.log(error)
    }
  },

  postUpdateESL: async (req, res) => {
    try {
      const data = await Sanluong.findByIdAndUpdate(req.params.id, {
        electric_output: req.body.electric,
        accumulated_month: req.body.electric,
        accumulated_year: req.body.electric,
      }, { new: true, upsert: true, returnDocument: true })

      const findData = await Sanluong.find({ time: { $gte: changeTime(data.time) }, month: data.month, year: data.year })
      for (let i = 1; i < findData.length; i++) {
        const find = await Sanluong.find({ time: { $gte: changeTime(data.time) }, month: data.month, year: data.year }).sort({ time: 1 })
        await Sanluong.updateOne(
          { "_id": find[i]._id },
          {
            $set: {
              accumulated_month: Number(find[i].electric_output) + Number(find[i - 1].accumulated_month),
              accumulated_year: Number(find[i].electric_output) + Number(find[i - 1].accumulated_year)
            }
          },
          { new: true }
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
      const data = await Sanluong.find({}).sort({ time: -1 })
      let dt = [];
      data.forEach((element, i) => {
        const { electric_output, accumulated_month, accumulated_year, revenue, revenue_month, revenue_year, time } = element
        dt.push({ i, time, electric_output, accumulated_month, accumulated_year, revenue, revenue_month, revenue_year })
      });

      const wb = new excel.Workbook();
      const ws = wb.addWorksheet('DataSheet');

      const style = wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: 'center',
          vertical: 'center',
        },
      });

      ws.column(1).setWidth(5)
      ws.column(2).setWidth(13)
      ws.column(3).setWidth(20)
      ws.column(4).setWidth(15)
      ws.column(5).setWidth(15)
      ws.column(6).setWidth(20)
      ws.column(7).setWidth(15)
      ws.column(8).setWidth(15)

      ws.cell(1, 1, 2, 1, true).string('STT').style(style);
      ws.cell(1, 2, 2, 2, true).string('Thời gian').style(style);
      ws.cell(1, 3, 2, 3, true).string('Sản lượng điện (Kwh)').style(style);
      ws.cell(1, 4, 1, 5, true).string('Sản lượng lũy kế (Kwh)').style(style);
      ws.cell(1, 6, 2, 6, true).string('Doanh thu (VNĐ)').style(style);
      ws.cell(1, 7, 1, 8, true).string('Doanh thu lũy kế (VNĐ)').style(style);

      ws.cell(2, 4).string('Tháng').style(style);
      ws.cell(2, 5).string('Năm').style(style);
      ws.cell(2, 7).string('Tháng').style(style);
      ws.cell(2, 8).string('Năm').style(style);

      dt.forEach((item, index) => {
        ws.cell(index + 3, 1).number(item.i);
        ws.cell(index + 3, 2).string(item.time);
        ws.cell(index + 3, 3).number(item.electric_output || 0);
        ws.cell(index + 3, 4).number(item.accumulated_month);
        ws.cell(index + 3, 5).number(item.accumulated_year);
        ws.cell(index + 3, 6).number(item.revenue || 0);
        ws.cell(index + 3, 7).number(item.revenue_month);
        ws.cell(index + 3, 8).number(item.revenue_year);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "Data.xlsx"
      )

      wb.writeToBuffer().then(buffer => {
        res.end(buffer);
      });
    } catch (err) {
      console.log(err)
    }
  },

  getExportAllTT: async (req, res) => {
    try {
      const data = await Tinhtoan.find({});
      let dt = [];
      data.forEach((value) => {
        const { nuoctruoc, dungtichtruoc, nuocsau, dungtichsau, qmay, qxa, qho, timeday, timehour } = value;
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
        const { nuoctruoc, dungtichtruoc, nuocsau, dungtichsau, qmay, qxa, qho, timeday, timehour } = value;
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
    const data = await Sanluong.find({ "time": { $gte: req?.body?.dateStart, $lt: req?.body?.dateEnd } })
    let dt = [];
    data.forEach((value) => {
      const { time, congsuat, giadien, tongtien } = value;
      dt.push({ time, congsuat, giadien, tongtien });
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
  },

  getMonthData: async (req, res) => {
    const month = new Date()
    const data = await Sanluong.find({ month: (month.getMonth() + 1) }).sort({ time: -1 })
    return res.json(data)
  }
};
