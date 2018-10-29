var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
   
    title : {
        type : String,
        required : true,
        minlength : 1,
        trim : true  
    },
    description : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },

    // TODO: Add "Initiator" and "Report to" (array if multiple people)
    //       Status (may include initiation date, last update)
    // Note: think about framework for success when designing
    /*
    reportTo: {
        ...
    }
    */
    rewardPoints : {
        type : Number,
        default : null
    },
    priority : {
        type : Number,
        required : true,
        default : 0
    },
    
    duration : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },
    url : {
        type : String,
        trim : true
    },
    color : {
        type : String,
        default : "#e828e9"
    },
    category : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },
    isComplete : {
        type : Boolean,
        default : false
    },
    
    
    
    // for example: administrative, communication, generic, specific, departmental, travel
    // Business will classify these
    type : {
        type : String,
        required : true,
        minlength : 1,
        trim : true  
    },

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

var Task = mongoose.model('Tasks',taskSchema);

module.exports = {Task};