const Tinhtoan = require("../models/tinhtoan.js");
const Buocxa = require("../models/buocxa.js");
const Hochua = require("../models/hochua.js");
const Sanluong = require("../models/sanluong.js");
const Taikhoan = require("../models/taikhoan.js");
const Thongbao = require("../models/thongbao.js");
const excelJS = require("exceljs");
const excel = require("excel4node");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
require('dotenv').config()

function changeTime(time) {
  const data = new Date(time);
  data.setDate(data.getDate() - 1);
  return data.toISOString().slice(0, 10);
}

async function deleteFile(dirPath) {
  try {
    fs.readdirSync(dirPath).forEach(file => {
      fs.rmSync(path.join(dirPath, file));
    });
  } catch (error) {
    console.log(error);
  }
}

function readExcelData(filePath) {
  const data = [];
  const cvTime = [];
  const index = [0,3,6];
  const valueTime = ['P2', 'N2', 'L2'];
  filePath.forEach(file => {
    const workbook = XLSX.readFile(file.path);
    const worksheetTime = workbook.Sheets[workbook.SheetNames[1]];
    const worksheetValue = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[4]],{
      range: 'G24:G30',
      header: 1
    });

    const valueSheet = index.map((index)=>worksheetValue[index][0])
    data.push(valueSheet)

    const dataTime = valueTime.map((cellTime) =>
      worksheetTime[cellTime] ? worksheetTime[cellTime].v : null
    );
    const createTime = dataTime.join('-');
    cvTime.push(createTime);
  });

  deleteFile('./public/files')

  const arr = cvTime.map((value, index) => [value, ...data[index]])

  return arr;
}

async function getData() {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
      },
      body:JSON.stringify({
        "username":process.env.USER_API,
        "password":process.env.PASS_API
      })
    }
    const response = await fetch('http://116.101.68.94:8080/api/renew/auth/login',options)
    const data = await response.json()
    const bearer = 'Bearer ' + data.data.account.token
    const option = {
      method: 'GET',
      withCredentials: true,
      credentials: 'include',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      }
    }
    const respon = await fetch('http://116.101.68.94:8080/api/renew/v1/dashboard/waterdepth/getall',option)
    const dataAll = await respon.json()
    // dataAll.data[0].current_discharge_in //Q vào - Mực nước Hồ Chứa
    // dataAll.data[0].qin_forecast //Q vào dự báo - Mực nước Hồ Chứa
    // dataAll.data[0].current_data //Mực nước Hồ Chứa
    // dataAll.data[1].current_data //Hạ lưu nhà máy 
    // dataAll.data[0].current_data_at //time
    // dataAll.data[0].current_volume //V - Mực nước Hồ Chứa
    return dataAll;
  } catch(err) {
    console.log(err)
  }
}

module.exports = {
  changeTime: changeTime,

  readExcelData: readExcelData,

  getMain: async (req, res) => {
    const datetime = new Date();
    const timeCurrent = datetime.toISOString().slice(0, 10);
    const data = await Sanluong.find({ time: timeCurrent });
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    const check = await getData()
    res.locals.moment = moment;
    res.render("main", { data: data, roleUser: req.role, value: check});
  },
  

  getThongbao: async (req, res) => {
    const data = await Thongbao.find({});
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("thongbao", { data: data, roleUser: req.role });
  },

  getBuocxa: async (req, res) => {
    const data = await Buocxa.find({}).sort({ buoc: 1 });
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("table_buocxa", { table: data, roleUser: req.role });
  },

  getSanluong: async (req, res) => {
    const data = await Sanluong.find({}).sort({ time: -1 });
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("table_sanluong", { table: data, roleUser: req.role });
  },

  getCheckTime: async (req, res) => {
    try {
      const { acc_month, acc_year, rev_month, rev_year } = 0;
      const datetime = new Date();
      datetime.setDate(datetime.getDate() + 1);
      const timeCurrent = datetime.toISOString().slice(0, 10);
      const data = await Sanluong.find({ time: timeCurrent });

      if (data.length > 0) return res.json("Exist");

      const beforeData = await Sanluong.find({ time: changeTime(datetime) });
      beforeData.map((item) => {
        acc_month = item.accumulated_month;
        acc_year = item.accumulated_year;
        rev_month = item.revenue_month;
        rev_year = item.revenue_year;
      });

      if (datetime.getDate() > 1) {
        const createData = new Sanluong({
          time: timeCurrent,
          electric_output: null,
          month: datetime.getMonth() + 1,
          year: datetime.getFullYear(),
          accumulated_month: acc_month,
          accumulated_year: acc_year,
          revenue: null,
          revenue_month: rev_month,
          revenue_year: rev_year,
        });
        createData.save();
      } else {
        const createData = new Sanluong({
          time: timeCurrent,
          electric_output: null,
          month: datetime.getMonth() + 1,
          year: datetime.getFullYear(),
          accumulated_month: null,
          accumulated_year: acc_year,
          revenue: null,
          revenue_month: null,
          revenue_year: rev_year,
        });
        createData.save();
      }
      return res.json("Success");
    } catch (err) {
      return res.json(err);
    }
  },

  getTinhtoan: async (req, res) => {
    const data = await Tinhtoan.find({});
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("table_tinhtoan", { table: data, roleUser: req.role });
  },

  getAccount: async (req, res) => {
    const data = await Taikhoan.find({ role: "50" });
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.moment = moment;
    res.render("table_taikhoan", { table: data, roleUser: req.role });
  },

  getDownload: async (req, res) => {
    const data = await Download.find({});
    res.render("table_download", { table: data, roleUser: req.role });
  },

  getAddTT: async (req, res) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("form_addTT", { roleUser: req.role });
  },

  getEditTT: async (req, res) => {
    const data = await Tinhtoan.findById({ _id: req.params.id });
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("form_editTT", { data: data, roleUser: req.role });
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
    res.flash("success", "Cập nhật thành công");
    res.redirect("/tinhtoan");
  },

  postUpdateRSL: async (req, res) => {
    const data = await Sanluong.findByIdAndUpdate(
      req.params.id,
      {
        revenue: req.body.revenue
      },
      { new: true, upsert: true, returnDocument: true }
    );

    const findData = await Sanluong.find({
      time: { $gte: changeTime(data.time) },
      year: data.year,
    });

    for (let i = 1; i < findData.length; i++) {
      const find = await Sanluong.find({
        time: { $gte: changeTime(data.time) },
        year: data.year,
      }).sort({ time: 1 });

      if (find[i].time.slice(8, 10) == 1) {
        await Sanluong.updateOne(
          { _id: find[i]._id },
          {
            $set: {
              revenue_month: Number(find[i].revenue),
              revenue_year:
                Number(find[i].revenue) + 
                Number(find[i - 1].revenue_year),
            },
          },
          { new: true }
        );
      } else {
        await Sanluong.updateOne(
          { _id: find[i]._id },
          {
            $set: {
              revenue_month:
                Number(find[i].revenue) + Number(find[i - 1].revenue_month),
              revenue_year:
                Number(find[i].revenue) + Number(find[i - 1].revenue_year),
            },
          },
          { new: true }
        );
      }
    }

    req.flash("success", "Cập nhật thành công");
    return res.redirect("/sanluong");
  },

  postUpdateESL: async (req, res) => {
    // var svalue= req.body.electric
    // var regex=/^\d*\,?\d*\.?\d+$/;
    // if (!svalue.match(regex))
    // {
    //   req.flash("error", "Dữ liệu không phải dạng số");
    //   return res.redirect(req.get("referer"));
    // }
      
    const data = await Sanluong.findByIdAndUpdate(
      req.params.id,
      {
        electric_output: req.body.electric
      },
      { new: true, upsert: true, returnDocument: true }
    );

    const findData = await Sanluong.find({
      time: { $gte: changeTime(data.time)},
      year: data.year 
    });

    for (let i = 1; i < findData.length; i++) {
      const find = await Sanluong.find({
        time: { $gte: changeTime(data.time) },
        year: data.year,
      }).sort({ time: 1 });

      if (find[i].time.slice(8,10) == 1) {
        await Sanluong.updateOne(
          { _id: find[i]._id },
          {
            $set: {
              accumulated_month: Number(find[i].electric_output),
              accumulated_year:
                Number(find[i].electric_output) +
                Number(find[i - 1].accumulated_year),
            },
          },
          { new: true }
        );
      } else {
        await Sanluong.updateOne(
          { _id: find[i]._id },
          {
            $set: {
              accumulated_month:
                Number(find[i].electric_output) +
                Number(find[i - 1].accumulated_month),
              accumulated_year:
                Number(find[i].electric_output) +
                Number(find[i - 1].accumulated_year),
            },
          },
          { new: true }
        );
      }
    }

    req.flash("success", "Cập nhật thành công");
    return res.redirect("/sanluong");
  },

  postCreateTT: async (req, res) => {
    const data = new Tinhtoan({
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

    req.flash("success", "Tạo thành công");
    return res.redirect("/tinhtoan");
  },

  // postCreateHC: async (req, res) => {
  //   await Hochua.create(req.body);

  //   req.flash('msg','Cập nhật thành công')
  //   res.json("success");
  // },

  // postCreateBX: async (req, res) => {
  //   await Buocxa.create(req.body);

  //   req.flash('msg','Cập nhật thành công')
  //   res.json("success");
  // },

  getDeleteTT: async (req, res) => {
    const del = await Tinhtoan.findByIdAndDelete(req.params.id);

    req.flash("success", "Xóa thành công");
    return res.redirect("/tinhtoan");
  },

  // getFile: async (req, res) => {
  //   try {
  //     const file = await reader.readFile("buocxa.xlsx");
  //     const data = [];
  //     const sheets = file.SheetNames;

  //     for (const i = 0; i < sheets.length; i++) {
  //       const temp = reader.utils.sheet_to_json(
  //         file.Sheets[file.SheetNames[i]]
  //       );
  //       temp.forEach((res) => {
  //         data.push(res);
  //       });
  //     }

  //     res.json(data);
  //   } catch (err) {
  //     res.json(err);
  //   }
  // },

  getClick: async (req, res) => {
    if (Number.isInteger(Number(req?.body?.value))) {
      const value = Number(req?.body?.value).toFixed(2).toString();
      const data = await Hochua.find({ mnh: value });
      const obj = data.reduce((accumulator, data) => {
        return { ...accumulator, val: data.dungtich };
      }, {});

      return res.json({ data: obj });
    } else {
      const data = await Hochua.find({ mnh: req?.body?.value });
      const obj = data.reduce((accumulator, data) => {
        return { ...accumulator, val: data.dungtich };
      }, {});

      return res.json({ data: obj });
    }
  },

  getExportAllSL: async (req, res) => {
    try {
      const data = await Sanluong.find({}).sort({ time: -1 });
      const dt = [];
      data.forEach((element, i) => {
        const {
          electric_output, accumulated_month, accumulated_year,
          revenue, revenue_month, revenue_year, time
        } = element;
        dt.push({
          i, time, electric_output, accumulated_month, accumulated_year,
          revenue, revenue_month, revenue_year
        });
      });

      const wb = new excel.Workbook();
      const ws = wb.addWorksheet("DataSheet");

      const style = wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: "center",
          vertical: "center",
        },
      });

      ws.column(1).setWidth(5);
      ws.column(2).setWidth(13);
      ws.column(3).setWidth(20);
      ws.column(4).setWidth(15);
      ws.column(5).setWidth(15);
      ws.column(6).setWidth(20);
      ws.column(7).setWidth(15);
      ws.column(8).setWidth(15);

      ws.cell(1, 1, 2, 1, true).string("STT").style(style);
      ws.cell(1, 2, 2, 2, true).string("Thời gian").style(style);
      ws.cell(1, 3, 2, 3, true).string("Sản lượng điện (Kwh)").style(style);
      ws.cell(1, 4, 1, 5, true).string("Sản lượng lũy kế (Kwh)").style(style);
      ws.cell(1, 6, 2, 6, true).string("Doanh thu (VNĐ)").style(style);
      ws.cell(1, 7, 1, 8, true).string("Doanh thu lũy kế (VNĐ)").style(style);

      ws.cell(2, 4).string("Tháng").style(style);
      ws.cell(2, 5).string("Năm").style(style);
      ws.cell(2, 7).string("Tháng").style(style);
      ws.cell(2, 8).string("Năm").style(style);

      dt.forEach((item, index) => {
        ws.cell(index + 3, 1).number(item.i);
        ws.cell(index + 3, 2).string(item.time);
        ws.cell(index + 3, 3).number(item.electric_output || 0);
        ws.cell(index + 3, 4).number(item.accumulated_month || 0);
        ws.cell(index + 3, 5).number(item.accumulated_year || 0);
        ws.cell(index + 3, 6).number(item.revenue || 0);
        ws.cell(index + 3, 7).number(item.revenue_month || 0);
        ws.cell(index + 3, 8).number(item.revenue_year || 0);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "Data.xlsx"
      );

      wb.writeToBuffer().then((buffer) => { res.end(buffer) });
    } catch (err) {
      res.status(500).json(err)
    }
  },

  getExportAllTT: async (req, res) => {
    try {
      const data = await Tinhtoan.find({});
      const dt = [];
      data.forEach((value) => {
        const {
          nuoctruoc, dungtichtruoc, nuocsau, dungtichsau,
          qmay, qxa, qho, timeday, timehour
        } = value;
        dt.push({
          nuoctruoc, dungtichtruoc, nuocsau, dungtichsau,
          qho, qmay, qxa, timehour, timeday
        });
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
      const dt = [];
      data.forEach((value) => {
        const {
          nuoctruoc,
          dungtichtruoc,
          nuocsau,
          dungtichsau,
          qmay,
          qxa,
          qho,
          timeday,
          timehour,
        } = value;
        dt.push({
          nuoctruoc,
          dungtichtruoc,
          nuocsau,
          dungtichsau,
          qho,
          qmay,
          qxa,
          timehour,
          timeday,
        });
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
    const data = await Sanluong.find({
      time: { $gte: req?.body?.dateStart, $lt: req?.body?.dateEnd },
    });
    const dt = [];
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
      { header: "Tổng tiền", key: "tongtien", width: 15 },
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

    return workbook.xlsx.write(res).then(() => res.end());
  },

  getFetchData: async (req, res) => {
    const time = new Date();
    const year = time.getFullYear();
    const data = await Sanluong.find({ year: year });
    return res.json(data);
  },

  getMonthData: async (req, res) => {
    const month = new Date();
    const data = await Sanluong.find({ month: month.getMonth() + 1 }).sort({
      time: -1,
    });
    return res.json(data);
  },

  getYearData: async (req, res) => {
    const month = new Date();
    const data = await Sanluong.find({ year: month.getFullYear() }).sort({
      time: -1,
    });

    const result = Object.values(
      data.reduce((acc, curr) => {
        const { month, time, year, accumulated_month } = curr;
        if (!acc[month] || acc[month].time < time) {
          acc[month] = { month, year, accumulated_month };
        }
        return acc;
      }, {})
    );

    return res.json(result);
  },

  postCSVExcel: async (req, res) => {
    const data = readExcelData(req.files);
    data.forEach(async (item) => {
      const [time, electric_output, accumulated_month, accumulated_year] = item;
      const date = new Date(time);
      date.setDate(date.getDate() + 1);
      const value = date.toISOString().slice(0, 10);
      try {
        await Sanluong.create({
          time: value,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          electric_output: electric_output.toString(),
          accumulated_month: accumulated_month.toString(),
          accumulated_year: accumulated_year.toString(),
          revenue: null,
          revenue_month: null,
          revenue_year: null,
        });
      } catch (err) {
        req.flash("error", "Không thể thêm dữ liệu");
        return res.redirect(req.get("referer"));
      }
    });

    req.flash("success", "Thêm thành công");

    return res.redirect("/sanluong");
  },

};
