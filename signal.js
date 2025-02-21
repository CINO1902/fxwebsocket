const mongoose = require("mongoose")

const Schema = mongoose.Schema

const signals = Schema({
    id:{
        type:String
    },
    signal_name:{
        type:String
    },
    signal_type:{
        type:String
    },
    stop_loss:{
        type:String
    },
    order:{
        type:String
    },
    entries:{
        type:String
    },
    final_price:{
        type:String
    },
    entry:{
        type:String
    },
    active:{
        type:Boolean
    },
    take_profit:{
        type:String
    },
    access_type:{
        type:String
    },
    date_created:{
        type:Date
    }
})

module.exports = mongoose.model('signals', signals);