const mongoose = require('mongoose')

const BuocxaSchema = new mongoose.Schema ({
    buoc: { type: Number },
    domo: { type: Number },
    cuaxa: { type: Number },
    trinh235: { type: Number },
    trinh240: {type: Number}
})

module.exports = mongoose.model('buocxa',BuocxaSchema)