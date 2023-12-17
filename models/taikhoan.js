const mongoose = require('mongoose')

const TaikhoanSchema = new mongoose.Schema ({
    name: { type: String},
    username: { type: String },
    password: { type: String },
    refreshToken: { type: String },
    role: { type: String }
}, {
    timestamps: true
})

module.exports = mongoose.model('taikhoan',TaikhoanSchema)