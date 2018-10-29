var {Employee}=require('./../models/employeeModel')
var jwt=require('jsonwebtoken')

var authenticateHR = (req,res,next)=>{

    var token = req.header('auth')
    var id = ""
    if(token == null || token.length == 0){
        id = null
    }else{
        var decoded = jwt.verify(token,'testing123')
        // var currentTime = new Date().getTime() / 1000;
        // if(decoded.iat + (3600*12) < currentTime){
        //     throw('Token Expired');
        // }
        id = decoded._id
    }

   

    Employee.findOne({'_id':id}).then((employee) => {

        if(!employee){
            res.status(401).send({'error' : 'Could not find the Employee with the Token ID'})
        }else{

            if(employee.permissions.indexOf('HRBP') > -1){
                req.access = "HRBP"
                req.employee = employee
                next()
            }else{
                // res.status(401).send('Unauthorized to access HRBP priveledges')
                reject() 
            }
        }

        
    }).catch((e)=>{
        res.status(401).send({'error' : 'Unauthorized to access HRBP priveledges'})
    });

};

module.exports={authenticateHR};