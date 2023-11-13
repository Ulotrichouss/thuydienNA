const mongoose = require('mongoose')

const SanluongSchema = new mongoose.Schema ({
    time: { type: String, created: Date},
    electric_output: { type: Number },
    month: { type: String, created: Date},
    year: { type: String, created: Date},
    accumulated_month: { type: Number },
    accumulated_year: { type: Number },
    revenue: { type: Number },
    revenue_month: { type: Number },
    revenue_year: { type: Number },
})

module.exports = mongoose.model('sanluong',SanluongSchema)