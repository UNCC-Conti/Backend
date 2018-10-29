var express = require("express");
var router = express.Router();
var _ = require('lodash');
var { authentication } = require('./../middleware/authentication');
var { authenticateEmployee } = require('./../middleware/authenticationEmployee');

var bcrypt = require('bcryptjs');
const { mongoose } = require('./../dbConfig/mongoose');

var { Employee } = require('./../models/employeeModel');
var { Log } = require('./../models/logModel');
var { TaskTemplate } = require('./../models/taskTemplateModel');
var { Quiz } = require('./../models/quizModel');

router.post('/login', function (req, res) {

    var email = req.body.email;
    var password = req.body.password;

    Employee.findByCred(email, password).then((employee) => {
			var token = employee.generateAuthToken();
			var result = { 'token':token };

			res.status(200).header('auth', token).send(result);

	}).catch((e) => {
		var result = { 'error' : "Invalid Credentials" };
		res.status(400).send(result);
	});
});

router.get('/login', function (req, res) {

    var email = req.header("email");
    var password = req.header("password");

    Employee.findByCred(email, password).then((employee) => {
			var token = employee.generateAuthToken();
			var result = { 'token':token };

			res.status(200).header('auth', token).send(result);

	}).catch((e) => {
		var result = { 'error' : "Invalid Credentials" };
		res.status(400).send(result);
	});
});


router.put('/changePassword', authenticateEmployee, function (req, res) {

	var d = new Date(); 	

	var password = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var confirmNewPassword = req.body.confirmNewPassword;
    Log.updateLog(req.employee._id,"Changing the Password");
	
	bcrypt.compare(password,req.employee.password,(err,reso)=>{
		if(reso){
			if (newPassword == confirmNewPassword) {

				req.employee.password = newPassword;
				req.employee.save(req.employee).then(() => { //changed this part
					res.status(200).send({ 'status': 'Successfully changed the password' });
				});
			} else {
				res.status(400).send({ 'error': 'New Passwords do not match!!' });
			}
		}
		else{
			res.status(400).send({ 'error': 'Password Incorrect' });
		}
	});

});

router.get('/assignedQuizzes', authenticateEmployee, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List assigned quiz")
    var id = req.employee._id

    Employee.find({"_id":id}, {quizzes:1, _id:0}).then((quizzes) => {
		var response = [];
		console.log("Quizzes are : " + quizzes)
		for(var i = 0; i < quizzes[0].quizzes.length;i++){

			var body = {
				quizName: quizzes[0].quizzes[i].quiz.quizName,
				quizDescription: quizzes[0].quizzes[i].quiz.quizDescription,
				currentProgress: quizzes[0].quizzes[i].quiz.currentProgress,
				referenceDocId: quizzes[0].quizzes[i].quiz.referenceDocId,
				startDate: quizzes[0].quizzes[i].startDate,
				dueDate: quizzes[0].quizzes[i].dueDate,
				status: quizzes[0].quizzes[i].status,
				quizId: quizzes[0].quizzes[i]._id,
				timeInMinutes: quizzes[0].quizzes[i].quiz.timeInMinutes,
				score: quizzes[0].quizzes[i].quiz.score,
				attemptNumber: quizzes[0].quizzes[i].quiz.attemptNumber,
				numberOfAttempts: quizzes[0].quizzes[i].quiz.numberOfAttempts,
				rewardPoints: quizzes[0].quizzes[i].quiz.rewardPoints
			};
			response.push(body);
		}
		Log.updateLog(id, "Viewing the assigned quizzes")
		res.status(200).send({"quizzes":response});
    }, (e) => {
		res.status(400).send({'status': 'Error getting all the quizzes for the employee', 'Error': e})
	})
})

router.get('/assignedTasks', authenticateEmployee, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List assigned quiz")
    var id = req.employee._id

    Employee.find({"_id":id}, {tasks:1, _id:0}).then((tasks) => {

		Log.updateLog(id, "Viewing the assigned quizzes")
		res.status(200).send(tasks[0]);
    }, (e) => {
		res.status(400).send({'status': 'Error getting all the Tasks for the employee', 'Error': e})
	})
})

router.get('/viewTask',authenticateEmployee,function(req,res){

	var taskId = req.header('taskId');


	Employee.find({"_id":req.employee._id },function(err,employee){
        
        if(!employee){
			res.status(400).send(err); 
		}
        else{

			if(employee.length > 0){
				// console.log(employee[0].quizzes)
				var response = [];
				for(var i = 0; i < employee[0].tasks.length;i++){

					if(employee[0].tasks[i]._id == taskId){
						

						console.log("Responses are : " + employee[0].tasks[i])
						Log.updateLog(req.employee._id, "Viewing a particular quiz with id " + taskId)
						res.status(200).send({"task":employee[0].tasks[i]});
						break;
					}
				}
				
			}else{
				res.status(400).send({"error" : "Could not find any employee"}); 
			}
			
        }

	}).catch((e)=>{
		res.send({"Error":"Error while doing stuff"});

	});
});

router.get('/quizOutcome', authenticateEmployee, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List assigned quiz")
	var id = req.employee._id
	var quizId = req.header('quizId')

    Employee.find({"_id":id}, {quizzes:1, _id:0}).then((quizzes) => {
		var response = [];
		console.log("Quizzes are : " + quizzes)
		for(var i = 0; i < quizzes[0].quizzes.length;i++){

			if(quizId == quizzes[0].quizzes[i]._id) {
				var body = {
					quizName: quizzes[0].quizzes[i].quiz.quizName,
					quizDescription: quizzes[0].quizzes[i].quiz.quizDescription,
					currentProgress: quizzes[0].quizzes[i].quiz.currentProgress,
					referenceDocId: quizzes[0].quizzes[i].quiz.referenceDocId,
					startDate: quizzes[0].quizzes[i].startDate,
					dueDate: quizzes[0].quizzes[i].dueDate,
					status: quizzes[0].quizzes[i].status,
					quizId: quizzes[0].quizzes[i]._id,
					timeInMinutes: quizzes[0].quizzes[i].quiz.timeInMinutes,
					score: quizzes[0].quizzes[i].quiz.score,
					attemptNumber: quizzes[0].quizzes[i].quiz.attemptNumber,
					numberOfAttempts: quizzes[0].quizzes[i].quiz.numberOfAttempts,
					rewardPoints: quizzes[0].quizzes[i].quiz.rewardPoints
				};
				response.push(body);
			}
			
		}
		Log.updateLog(id, "Viewing the Outcome of a particular quiz")
		res.status(200).send({"quiz":response});
    }, (e) => {
		res.status(400).send({'status': 'Error getting all the quizzes for the employee', 'Error': e})
	})
})

/* TODO:
	API name : /active
	This api should change the status of that user from active to inactive
	We will determine the user based on the authentication part and then change his status only to active
*/

router.put('/updateQuizStatus', authenticateEmployee, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Updating Quiz Status");

	var quizId = req.body.quizId;
	var currentProgress = req.body.currentProgress;
	var responses = req.body.responses;

    Employee.updateOne({"_id":req.employee._id,"quizzes._id":quizId},
                   { "$set": { "quizzes.$.quiz.currentProgress": Number(currentProgress),"quizzes.$.quiz.responses":responses}},
                   function(err, model) {
        if(err)
        {
            res.status(400).send(err);
        }
        else{
            Log.updateLog(req.employee._id, "Updating the Quiz status for : " + quizId)
			res.send({"status":"Successfully updated quiz status"});
        }

	});
	

});

router.put('/submitQuiz', authenticateEmployee, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Updating Quiz Status");

	var quizId = req.body.quizId;
	var currentProgress = req.body.currentProgress;
	var responses = req.body.responses;

	Employee.find({"_id":req.employee._id, "quizzes._id" : quizId}, {quizzes:1, rewardPoints:1, _id:0}).then((quizzes) => {
		var quiz;
		console.log("Quizzes are : " + quizzes)
		for(var i = 0; i < quizzes[0].quizzes.length;i++){

			if(quizzes[0].quizzes[i]._id == quizId){
				quiz = quizzes[0].quizzes[i].quiz

				attemptNumber = quiz.attemptNumber + 1
				var score = 0
				var total = 0
				for(var j = 0; j < quiz.questions.length;j++){
					if(quiz.questions[j].answer == responses[j]){
						score = score + quiz.questions[j].question.points
					}
					total = total + quiz.questions[j].question.points
				}
				var status = "Pending"
				// var newRewardPoints = quizzes[1]
				if(score*100/total > quiz.threshold){
					status = "Passed"
				}else{
					status = "Failed"
				}

				Employee.updateOne({"_id":req.employee._id,"quizzes._id":quizId},
				{ "$set": { "quizzes.$.quiz.currentProgress": Number(currentProgress),"quizzes.$.quiz.responses":responses, 
							"quizzes.$.quiz.score": score, "quizzes.$.quiz.attemptNumber": attemptNumber,
							"quizzes.$.status" : status}},
				function(err, model) {
					if(err){ res.status(400).send(err); }
					else{
						Log.updateLog(req.employee._id, "Submitted the Quiz status for : " + quizId)
						var body = {
							"status":"Successfully Submitted the quiz",
							"score" : score,
							"status" : status
						}
						res.send(body);
					}

				});
				break
			}
		}
		
    }, (e) => {
		res.status(400).send({'status': 'Error submitting the quizz for the employee', 'Error': e})
	})
});

router.put('/submitTask', authenticateEmployee, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Updating Quiz Status");

	var taskId = req.body.taskId;
	var message = req.body.message;
	var response = req.body.response;
	var isComplete = req.body.isComplete;
	var inputs = req.body.inputs

	if(isComplete){
		Employee.updateOne({"_id":req.employee._id,"tasks.$._id":taskId},
		{ "$set": { "tasks.$.message": message,"tasks.$.response":response, "tasks.$.inputs":inputs, 
					"tasks.$.isComplete": isComplete, "tasks.$.status" : "Complete"}},
			
			function(err, model) {
				if(err){ res.status(400).send(err); }
				else{
					Log.updateLog(req.employee._id, "Submitted the Quiz status for : " + taskId)
					var body = {
						"status" : "Successfully Completed The Task",
					}
					res.status(200).send(body);
				}
	
		}, (e) => {
			res.status(400).send({'status': 'Error submitting the quizz for the employee', 'Error': e})
		})
	}else{
		res.status(400).send({"status": "Task is not ready to complete."});
	}

});


module.exports = router;