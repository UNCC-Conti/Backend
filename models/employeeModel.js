var mongoose = require('mongoose');
var validator = require('validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var { Task } = require('./../models/taskModel');
var { Quiz } = require('./../models/quizModel');
var { Employee } = require('./../models/employeeModel');

var EmployeeSchema = new mongoose.Schema({

    // TODO! Add Salutation

    employeeId : {
        type : Number, 
        required : true, 
        unique : true,
        // validate : {
        //     validator : validator.isNumeric,
        //     message : '{VALUE} is not valid employee ID'
        // }
    },

    firstName : {
        type : String, 
        required : true,
        trim : true,
        minlength : 1
    }, 
    middleName : {
        type : String, 
        required : false,
        trim : true,
        minlength : 1
    }, 
    lastName : {
        type : String, 
        required : false,
        trim : true,
        minlength : 1
    },  

    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        validate : {
            validator : validator.isEmail,
            message : '{VALUE} is not valid email '
        }
    }, 
    password : {
        type : String,
        required : true,
        minlength : 6
    }, 
    mobilePhone : {
        type : String,
        required : true,
        // validate : {
        //     validator : validator.isMobilePhone,
        //     message : '{VALUE} is not valid mobile phone'
        // }
    },
    workPhone : {
        type : String,
        required : false,
        trim : true,
        minlength : 1
        // validate : {
        //     validator : validator.isMobilePhone,
        //     message : '{VALUE} is not valid work phone'
        // }
    },
    
    jobTitle : {
        type : String, 
        required : true,
        trim : true,
        minlength : 1
    }, 
    reportTo : {
        type : mongoose.Schema.Types.ObjectId, 
        ref: Employee,
        required : true,
    }, 

    // TODO: Find better way to delegate roles and permissions and user access
    permissions : {
        type : Array, 
        required : true,
        trim : true
    }, 

    authorizations : {   //Make it based on roles
        type : Array, 
        required : true,
        minlength : 1
    }, 

    //TODO: This might change depending on the feedback.
    locations :{
        location : {
            locationName:String,
            Departments: [],
            Division : []
        }
    },
    
    // departments : {
    //     type : Array,
    //     required : true,
    //     minlength : 1,
    //     trim : true
    // }, 
    // divisions : {
    //     type : Array,
    //     required : true,
    //     minlength : 1,
    //     trim : true
    // }, 

    active : {
        type : Boolean, 
        default : true
    }, 
    onLeave : {
        type : Boolean, 
        default : false
    }, 

    internal : {
        type : Boolean,
        default : false
    },
    HIPPA : {
        type : Boolean,
        default : false
    },
    ADA : {
        type : Boolean,
        default : false
    }, 

    interests : {
        type : Array,
        required : false,
    },  

    tasks : [{

        status : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        }, 
        startDate : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },
        dueDate : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },
		completedDate : {
            type : String,
            minlength : 1,
            trim : true
        },
		endDate : {
            type : String,
            minlength : 1,
            trim : true
        },
        title : {
            type : String,
            required : true,
            minlength : 1,
            trim : true  
        },
        instructions : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },rewardPoints : {
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
        inputs : [{
            name : {
                type : String
            },
            value : {
                type : Boolean,
                default : false
            }
        }],
        
        
        
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

    }],
    quizzes : [{

        quiz : {
            type : Object,
            required : true
        },

        status : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },
        startDate : {
            type : String,
            required : true,
            minlength : 1,
            trim : true
        },
        dueDate : {
            type: String,
            required : true,
            required : true,
            minlength : 1,
            trim : true
        },
        timeLeft : Number

    }],

    isPeerBuddy : {
        type : Boolean,
        default : true
    },
    peerBuddies : [{
        buddy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Employee
        },
    }],

    status : {
        type : String, 
        default : 'Active'
    },

    currentIncorrectAttempts: Number,

    notifications: [],

    rewardPoints: {
        type : Number,
        default : 0
    }

});

EmployeeSchema.pre('save',function(next){
    var employee=this;
    if(employee.isModified('password'))
    {
        bcrypt.genSalt(10,function(err,salt){

            bcrypt.hash(employee.password,salt,(err,hash)=>{
                employee.password=hash;
                next();
            })
        });
    }
    else{
        next();
    }
});

EmployeeSchema.methods.generateAuthToken = function(){

    var employee = this
    var access = employee.permissions
    var token = jwt.sign({_id:employee._id.toHexString(),access},'testing123').toString()
    return token
}

EmployeeSchema.statics.findByCred=function(email,password){
    
    var employee = this;
    return Employee.findOne({"email" : email}).then((employee)=>{

        if(!employee){
            return Promise.reject();
        }

        return new Promise((resolve,reject)=>{

            bcrypt.compare(password,employee.password,(err,res)=>{
                if(res){
                    resolve(employee);
                }
                else{
                    reject();
                }
            });
        });

    });
}


var Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = { Employee };