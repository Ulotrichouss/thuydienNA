const Tinhtoan = require("../models/tinhtoan.js")
const Buocxa = require("../models/buocxa.js")
const Hochua = require("../models/hochua.js")
const Sanluong = require("../models/sanluong.js")
const reader = require("xlsx")

module.exports = {

    getMain: async (req, res) => {
        const data = await Tinhtoan.find({})
        res.render("table_tinhtoan", { table: data })
    },

    getBuocxa: async (req, res) => {
        const data = await Buocxa.find({}).sort({ buoc: 1 })
        res.render("table_buocxa", { table: data })
    },

    getSanluong: async (req, res) => {
        const data = await Sanluong.find({})
        res.render("table_sanluong",{ table : data})
    },
      
    getAddTT: async (req, res) => {
        res.render("form_addTT")
    },

    getAddSL: async (req, res) => {
        res.render("form_addSL")
    },
      
    getEditTT: async (req, res) => {
        const data = await Tinhtoan.findById({ _id: req.params.id })
        res.render("form_editTT", { data: data })
    },

    getEditSL: async (req, res) => {
      const data = await Sanluong.findById({ _id: req.params.id })
      res.render("form_editSL", { data: data })
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
        })
        data.save()
        res.redirect("/")
    },

    postUpdateSL: async (req, res) => {
      const data = await Sanluong.findByIdAndUpdate(req.params.id, {
        congsuat: req.body.congsuat,
        giadien: req.body.giadien,
        tongtien: req.body.congsuat*req.body.giadien*1000
      })
      data.save()
      res.redirect("/sanluong")
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
        })
        data.save()
        res.redirect("/")
    },
    
    postCreateHC: async (req, res) => {
        await Hochua.create(req.body)
        res.json("success")
    },
      
    postCreateBX: async (req, res) => {
        await Buocxa.create(req.body)
        res.json("success")
    },

    postCreateSL: async (req, res) => {
      let datetime = new Date()
      let data = new Sanluong({
        congsuat: req.body.congsuat,
        giadien: req.body.giadien,
        tongtien: req.body.congsuat*req.body.giadien*1000,
        time: datetime.toISOString().slice(0,10)
      })
      data.save()
      res.redirect("/sanluong")
    },

    getDeleteTT: async (req, res) => {
        const del = await Tinhtoan.findByIdAndDelete(req.params.id)
        res.redirect("/")
    },

    getDeleteSL: async (req, res) => {
      const del = await Sanluong.findByIdAndDelete(req.params.id)
      res.redirect("/sanluong")
    },
      
    getFile: async (req, res) => {
        try {
          const file = await reader.readFile("buocxa.xlsx")
          let data = []
          const sheets = file.SheetNames
      
          for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
              data.push(res)
            })
          }
      
          res.json(data)
        } catch (err) {
          res.json(err)
        }
    },
      
    getClick: async (req, res) => {
        if (Number.isInteger(Number(req?.body?.value))) {
          const value = Number(req?.body?.value).toFixed(2).toString()
          const data = await Hochua.find({ mnh: value })
          const obj = data.reduce((accumulator, data) => {
            return { ...accumulator, val: data.dungtich }
          }, {})
      
          return res.json({
            data: obj,
          })
        } else {
          const data = await Hochua.find({ mnh: req?.body?.value })
          const obj = data.reduce((accumulator, data) => {
            return { ...accumulator, val: data.dungtich }
          }, {})
      
          return res.json({
            data: obj,
          })
        }
    }
}