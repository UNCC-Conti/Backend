var mongoose = require('mongoose');
var { Task } = require('./../models/taskModel');

var taskTemplateSchema = new mongoose.Schema({

    templateName : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },
    createdBy : {
        type : String,
        minlength : 1,
        trim : true
    },
    createdUserRole : {
        type : String,
        minlength : 1,
        trim : true
    },
    templateDescription : {
        type : String,
        minlength : 1,
        trim : true
    },
    duration : {
        type : String,
        default : 0,
        trim : true
    },
    active : {
        type : Boolean,
        default : true
    },
    assignedRoleId : {
        type : String,
        minlength : 1,
        trim : true
    },
    assignedDepartment : [{
        type : String,
        minlength : 1,
        trim : true
    }],
    todoTasks : [{
        task : {
            type : Task.schema,
            required : true
        },
    }],
    tags : [{
        type : String,
        minlength : 1,
        trim : true
    }] 
});

var TaskTemplate = mongoose.model('TaskTemplates',taskTemplateSchema);

module.exports = {TaskTemplate};
