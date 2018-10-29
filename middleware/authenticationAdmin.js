var {Employee}=require('./../models/employeeModel')
var jwt=require('jsonwebtoken')

var authenticateAdmin = (req,res,next)=>{

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

        if(employee.permissions.indexOf('ADMIN') > -1){
            req.access = "ADMIN"
        }else{
            // res.status(401).send('Unauthorized to access Admin priveledges')
            reject()
        }

        req.employee = employee
        next()
    }).catch((e)=>{
        res.status(401).send({'error' : 'Unauthorized to access Admin priveledges'})
    });

};

module.exports={authenticateAdmin};