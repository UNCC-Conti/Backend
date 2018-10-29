var mongoose = require('mongoose');
/**
 * This Schema is to hold all the locations of Continental Offices. 
 * The location is the location of the office and then each location have their own: 
 * 1) Location Name
 * 2) An array with all the departments 
 * 3) An array with all the devisions
 */
var logSchema = new mongoose.Schema({

    id : {
        type : String,
        required : true,
        trim : true,
        unique :true
    },
    firstName  :String,
    lastName : String,
    employeeId : Number, 
    status : {
        type : String,
        default : 'Active'
    },
    actions : [{
        action : {
            type : String,
            required : true,
            trim : true
        },
        time: {
            type : String,
            required : true,
            trim : true
        }
    }]
});

logSchema.statics.createLog=function(userId, empId, fName, lName){

    var log = this;
    var d = new Date(); 
    var body = {
        id : userId,
        firstName : fName,
        lastName : lName,
        employeeId : empId,
        actions : {
            action : "User is Created",
            time : d
        }
    }
    var logger = new Log(body);

    logger.save().then((doc) => {
        console.log(d + "\t" + "Log Creation Successful for " + doc.firstName + " " + doc.lastName + "\n");
    }).catch((e) => {
        console.log(d + "\t" + "Log Creation Failed\nError : " + e);
    });


}

logSchema.statics.updateLog=function(userId, action){

    var d = new Date(); 
    
    Log.update({'id' : userId, 'status' : 'Active'},
    {$push : {'actions' : {'action' : action, 'time' : d}}},
    function(err, model){

        if(err){
            console.log(d + "\t" + "Log Update Failed\nError" + err)
        }else{
            if (!model){
                console.log(d + "\t" + "Log Update Error\n");
            }else{
                console.log(d + "\t" + "Log Update Successful\n");
            }
        }
    }
)}

logSchema.statics.updateStatus=function(userId, st){

    var d = new Date(); 
    
    Log.update({'id' : userId},
    { "$set" : {'status' : st}},
    function(err, model){

        if(err){
            console.log(d + "\t" + "Log Status Update Failed\nError" + err)
        }else{
            if (!model){
                console.log(d + "\t" + "Log Status Update Error\n");
            }else{
                console.log(d + "\t" + "Log Status Update Successful\n" + JSON.stringify(model));
            }
        }
    }
)}

var Log = mongoose.model('Logs', logSchema);

module.exports = { Log };