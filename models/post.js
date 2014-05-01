var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Post = new Schema({
	name: { type: String },
	title: {type: String},
	post: {type: String},
	time: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Post', Post);