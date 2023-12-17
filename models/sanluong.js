const mongoose = require('mongoose')

const SanluongSchema = new mongoose.Schema ({
    time: { type: String, created: Date},
    electric_output: { type: Number, default: null },
    month: { type: String },
    year: { type: String },
    accumulated_month: { type: Number, default: null },
    accumulated_year: { type: Number, default: null },
    revenue: { type: Number, default: null },
    revenue_month: { type: Number, default: null },
    revenue_year: { type: Number, default: null },
}, {
    timestamps: true
})

module.exports = mongoose.model('sanluong',SanluongSchema)