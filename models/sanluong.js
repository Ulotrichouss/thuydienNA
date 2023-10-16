const mongoose = require('mongoose')

const SanluongSchema = new mongoose.Schema ({
    time: { type: String, created: Date},
    congsuat: { type: String },
    giadien: { type: String },
    tongtien: { type: String }
})

module.exports = mongoose.model('sanluong',SanluongSchema)