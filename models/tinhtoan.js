const mongoose = require('mongoose')

const TinhtoanSchema = new mongoose.Schema ({
    nuoctruoc: { type: String },
    dungtichtruoc: { type: String },
    nuocsau: { type: String },
    dungtichsau: { type: String },
    qmay: {type: String},
    qxa: {type: String},
    qho: {type: String},
    timeday: {type: String},
    timehour: {type: String},
})

module.exports = mongoose.model('tinhtoan',TinhtoanSchema)