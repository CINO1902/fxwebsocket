const mongoose = require("mongoose")

const Schema = mongoose.Schema

const pairPrice = Schema({
    pair:{
        type:String
    },
    price:{
        type:String
    },
    date_created:{
        type:Date
    }
})

module.exports = mongoose.model('pairPrice', pairPrice);