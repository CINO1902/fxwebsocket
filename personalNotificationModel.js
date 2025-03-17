const mongoose = require("mongoose")

const Schema = mongoose.Schema

const personalNotification = Schema({
    id:{
        type:String
    },
    title:{
        type:String
    },
    user_id:{
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

module.exports = mongoose.model('personalNotification', personalNotification);