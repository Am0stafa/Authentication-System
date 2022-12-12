const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        trim:true,
        required: true
    },
    email:{
        type: String,
        trim:true,
        required: true
    },
    password:{
        type: String,
        minlength: 8,
        required: true,
    },
    refreshToken:[String],//! it is an array for multi device support
    phoneNumber: {
        type:Number,
        
    },
    roles:{
        User: {
            type:Number,
            default:2001
        },
        Editor:Number,
        Admin:Number,
    },
    profilePic:{
        type:String,
        default:'https://'
    }

})

module.exports = mongoose.model('User',userSchema)