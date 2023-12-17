const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const ThongbaoSchema = new mongoose.Schema ({
    userId: { type: ObjectId, ref: 'taikhoan' },
    text: { type: String },
}, {
    timestamps: true
})

module.exports = mongoose.model('thongbao',ThongbaoSchema)