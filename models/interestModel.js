var mongoose = require('mongoose');

var interestSchema = mongoose.Schema ({
	interest: {
		type:String,
		required: true,
		unique:true,
		minlength: 1,
		trim: true
	},
	used: {
		type : Number,
		default: 0
	},
	category: String
});

interestSchema.statics.findByInterest = function(interest) {
	var Interest = this;
	return Interest.findOne({
		'interest' : interest
	});
}

var Interest = mongoose.model('Interests', interestSchema);
module.exports = {Interest};