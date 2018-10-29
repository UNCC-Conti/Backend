var {Employee}=require('./../models/employeeModel')
var jwt=require('jsonwebtoken')

var authentication = (req,res,next)=>{

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
            res.status(401).send({"error" : "Could not find the Employee with the Token ID"})
        }

        if(req.header('permission')){
            if(employee.permissions.indexOf(req.header('permission')) > -1){
                // res.status(200).send(req.header('accessLevel') + ' access granted')
                req.access = req.header('permission')
            }else{
                // res.status(401).send('Unauthorized to access ' + req.header('accessLevel') + ' priveledges')
                reject()
            }
        }else{
            req.access = "EMPLOYEE"
        }
        

        req.employee = employee
        next()
    }).catch((e)=>{
        res.status(401).send({"error" : 'Unauthorized to access ' + req.header('accessLevel') + ' priveledges'})
    });

};

module.exports={authentication};