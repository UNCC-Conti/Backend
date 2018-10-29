var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    
    problem : {
        question : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },
        options : Array,
        typeOfQuestion : String,
        points : {
            type : Number,
            default : 1
        }
    },

    answer : Array,
    
    location : {
        type : String,
        required : true,
        minlength : 1,
        trim : true  
    },
    department : {
        type : String,
        required : true,
        minlength : 1,
        trim : true  
    },
    division : {
        type : String,
        required : true,
        minlength : 1,
        trim : true  
    }
});

var Question = mongoose.model('Questions',questionSchema);

module.exports = {Question};