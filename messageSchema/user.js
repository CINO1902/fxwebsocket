const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const user = Schema({
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    email:{
        type: String
    },
    email_verify:{
        type: Boolean
    },
    completed_profile:{
        type: Boolean
    },
    password:{
        type:String
    },
    trading_experience:{
        type:String
    },
    fcmToken:{
        type:String
    },
    image_url:{
        type:String
    },
    allownotification:{
        type:Boolean
    },
    phone_number:{
        type:String
    },
    country:{
        type:String
    },
    token:{
        type:String
    },
    date:{
        type:Date
    }
})

module.exports = mongoose.model('registered', user);