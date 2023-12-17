const mongoose = require('mongoose')

const HochuaSchema = new mongoose.Schema ({
    mnh: { type: String, unique: true },
    dungtich: { type: String },
}, {
    timestamps: true
})

module.exports = mongoose.model('hochua',HochuaSchema)