const mongoose = require('mongoose')

const TaikhoanSchema = new mongoose.Schema ({
    name: { type: String},
    username: { type: String },
    password: { type: String },
    status: { type: String },
    time: { type: String,create:Date }
})

module.exports = mongoose.model('taikhoan',TaikhoanSchema)