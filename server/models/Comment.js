const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = mongoose.Schema({
    postId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 

    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'Account',  
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Comment', CommentSchema);