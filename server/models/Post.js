const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		minlength: 5,
	},
	content: {
		type: String,
		required: true,
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'Account',
		required: true,
	},
	link: {
		type: String,
	},
	likes: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Account',
		},
	],
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Comment',
		},
	],
	likeCount: {
		type: Number,
		default: 0,
	},
	commentCount: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Post', PostSchema);