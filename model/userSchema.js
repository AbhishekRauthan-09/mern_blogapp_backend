const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const userSChemas = new Schema({
    email:{
        type: 'string',
        required: true,
        min:5,
        unique: true,
    },
    username:{
        type: 'string',
        required: true,
        min:3,
        unique: true,
    },
    password:{
        required:true,
        type: 'string',
        min:5,
    },
    age:{
        type: 'number',
    }
})

const User = new mongoose.model('User', userSChemas);

module.exports = User;