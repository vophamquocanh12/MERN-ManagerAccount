const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    nickname: {
        type: String
    },
    username:{
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address.'
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String, 
        enum: ['admin', 'user'], default: 'user' 
    },
    friends: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Account' 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Account', AccountSchema);