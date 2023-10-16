const mongoose = require('mongoose')

const BuocxaSchema = new mongoose.Schema ({
    buoc: { type: Number },
    domo: { type: String },
    cuaxa: { type: Number },
    trinh235: { type: String },
    trinh240: {type: String}
})

module.exports = mongoose.model('buocxa',BuocxaSchema)