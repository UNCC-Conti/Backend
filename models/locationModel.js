var mongoose = require('mongoose');
/**
 * This Schema is to hold all the locations of Continental Offices. 
 * The location is the location of the office and then each location have their own: 
 * 1) Location Name
 * 2) An array with all the departments 
 * 3) An array with all the devisions
 */
var locationSchema = new mongoose.Schema({

    locationName : {
        type : String,
        unique : true,
        required : true,
        trim : true
    },
    departments : [{
        departmentName : {
            type : String,
            //unique : true,
            required : true,
            trim : true
        }
    }],
    divisions : [{
        divisionName : {
            type : String,
            //unique : true,
            required : true,
            trim : true
        }
    }]
});

var Loc = mongoose.model('Locations', locationSchema);

module.exports = { Loc };