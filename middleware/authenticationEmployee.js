var {Employee}=require('./../models/employeeModel')
var jwt=require('jsonwebtoken')

var authenticateEmployee = (req,res,next)=>{

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
        }

        let permissions = employee.permissions.map( x => x.toUpperCase());

        if(permissions.indexOf('EMPLOYEE') > -1){
            req.access = "EMPLOYEE"
        }else{
            // res.status(401).send('Unauthorized to access Employee priveledges')
            reject()
        }

        req.employee = employee
        next()
    }).catch((e)=>{
        res.status(401).send({'error' : 'Unauthorized to access Employee priveledges'})
    });

};

module.exports={authenticateEmployee};