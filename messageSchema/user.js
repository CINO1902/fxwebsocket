const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const user = Schema({
    firstname:{
        type:String,
        ref: 'firstname',
    },
    lastname:{
        type:String,
        ref: 'lastname',
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
        type:String,
        ref: 'fcmToken',
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
        type:String,
        ref: 'token',
    },
    date:{
        type:Date
    }
})

module.exports = mongoose.model('registered', user);