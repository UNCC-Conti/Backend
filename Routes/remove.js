var express = require("express");
var router = express.Router();
var _ = require('lodash');
const { mongoose } = require('./../dbConfig/mongoose');

var { Employee } = require('./../models/employeeModel');
var { Log } = require('./../models/logModel');

router.get("/",function(req,res){
	res.send("Devansh Test!");
});

router.delete('/employee', function (req, res) {

	var d = new Date(); 	
	console.log("" + d + "\tExecuting API : Remove Employee");

	var id = req.body.employeeId;
	var reason = req.body.reason;

	Employee.findOne({'employeeId' : id}, function (err, employee) {

		if (!employee)
			res.status(400).send("Could not find the Employee with the given ID");
		else {
			Log.updateLog("Removing the Employee with id : " + employee._id);
			Log.updateLog(employee._id,"Removing Employee from System");
			Log.updateStatus(employee._id, "Resigned");

			Employee.findOneAndRemove({'_id' : employee._id}, function (err, model) {
				if (err) {
					res.status(400).send(err);
				}
				else {
					var result = { 'action' : 'Removed Employee' + employee._id + ' from System' };
					res.status(200).send(result);
				}
			});
		}

	});
});

router.delete('/unassignTask', function (req, res) {

	var d = new Date(); 	
	console.log("" + d + "\tExecuting API : unassignTask");

	var id = req.body.employeeId;
	var taskId = req.body.taskId;

	Employee.findOne({'_id' : id}, function (err, employee) {

		for(var i = 0; i < employee.tasks.length; i++){
			if(taskId == employee.tasks[i]._id){
				employee.tasks.splice(i, 1);
			}
		}

		employee.save(employee).then(() => { //changed this part
			res.status(200).send({ 'status': 'Success' });
		});
	});
});

module.exports = router;