const mongoose = require('mongoose')

const DownloadSchema = new mongoose.Schema ({
    idname: { type: String},
    link: { type: String },
    time: { type: String,create:Date }
})

module.exports = mongoose.model('download',DownloadSchema)