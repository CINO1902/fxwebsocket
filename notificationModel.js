const mongoose = require("mongoose")

const Schema = mongoose.Schema

const notification = Schema({
    id:{
        type:String
    },
    signal_id:{
        type:String
    },
    title:{
        type:String
    },
    body:{
        type:String
    },
    payload:{
        type:String
    },
    date:{
        type:Date
    }
})

module.exports = mongoose.model('notification', notification);