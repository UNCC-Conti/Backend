var express = require("express")
var router = express.Router()
var _ = require('lodash')
var { authentication } = require('./../middleware/authentication')
var { authenticateEmployee } = require('./../middleware/authenticationEmployee')
var { authenticateHR } = require('./../middleware/authenticationHR');

var { Task } = require('./../models/taskModel');
var { Question } = require('./../models/questionModel');
var { TaskTemplate } = require('./../models/taskTemplateModel');
var { Quiz } = require('./../models/quizModel');

const { mongoose } = require('./../dbConfig/mongoose')
var {Employee}=require('./../models/employeeModel')
var { Log } = require('./../models/logModel')


/* TODO: 
    API name: /interest
	this api will assign a peer buddy to the logged in user
*/
router.put('/addInterest', authenticateEmployee, function(req,res){

    var interest = req.body.interest
    var employee = req.employee

    employee.interests.push(interest)

    employee.update(employee).then((result) => {
            res.status(200).send({'Result' : 'Succesfully Added the interest'})
    }, (e) => {
		    res.status(400).send({'Result' : 'Failed to add the interest', 'Error' : e});
	})

})

router.put('/task', authenticateHR, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Assign todo task");

	var _id = req.body.empId;
	var taskId = req.body.taskId;

	Task.findById(taskId, function (err, task) {

		if (!task) {
			res.status(400).send({'status': 'Error assigning task to employee. Task not found.', 'Error': err});
		}
		else {

			var body = {
				//                "taskId":todoId,
				"status": "open",
				"startDate": new Date(req.body.startDate),
				"dueDate": new Date(req.body.dueDate),
				"endDate": new Date(req.body.endDate) || new Date(req.body.dueDate),
				"title": task.title,
				"instructions": task.instructions,
				"rewardPoints": task.rewardPoints,
				"color": task.color,
				"duration": task.duration,
				"url": task.url,
				"type": task.type,
				"isComplete" : task.isComplete,
				"priority": task.priority,
				"category": task.category,
				"location":"Any",
				"division":"Any",
				"department":"Any",
				"inputs" : task.inputs
				
			};

			//console.log(body);

			Employee.findByIdAndUpdate(_id,
				{ $push: { "tasks": body } },
				{ safe: true, upsert: true },
				function (err, model) {
					if (err) {
						res.status(400).send({'status': 'Error assigning task to employee.', 'Error': err});
					}
					else {
						Log.updateLog(req.employee._id,"Assiging todo task: " + task.title + " to the user : " + model.firstName + " " + model.lastName);
						Log.updateLog(_id,"A new todo is assigned by + " + req.employee.firstName + " " +req.employee.lastName);
						res.status(200).send({ "status": "Successfully assigned the task" });
					}

				});
		}

	});

});

router.put('/taskTemplate', authenticateHR, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Assign task template");

	var _id = req.body.employeeId;
	var taskTemplateId = req.body.taskTemplateId;

	TaskTemplate.findById(taskTemplateId, function (err, tasks) {

		if (!tasks) {
			res.status(400).send({'status': 'Error assigning task to employee. Task not found.', 'Error': err});
		}

		console.log(tasks.todoTasks.length);

        var wentWrong = false
		for (var i = 0; i < tasks.todoTasks.length; i++) {

			console.log("Task at position " + i + " is " + tasks.todoTasks[i].task.description);
			console.log("Task id is " + tasks.todoTasks[i].task._id);

			var taskTemplateId = tasks.todoTasks[i].task._id;

            if(!wentWrong){
                Task.findById(taskTemplateId, function (err, task) {

                    if (!task) { 
                        wentWrong = true			
                    }
                    else {
                        var body = {
                            "task": task,
                            "status": "open",
                            "startDate": req.body.startDate,
                            "dueDate": req.body.dueDate
    
                        };
                        Employee.findByIdAndUpdate(_id,
                            { $push: { "todoTasks": body } },
                            { safe: true, upsert: true },
                            function (err, model) {
                                if (err) {
                                    wentWrong = true
                                }else{
                                    Log.updateLog(req.employee._id,"Assiging todo task: " + task.title + " to the user : " + model.firstName + " " + model.lastName);
						            Log.updateLog(_id,"A new todo is assigned by + " + req.employee.firstName + " " +req.employee.lastName);
                                }
                            });
                    }
                });
            }
		}
        
        if(wentWrong){
            res.status(400).send({'status': 'Error assigning task template to employee. Please try again.', 'Error': err});
        }else{
            // Log.update(req.employee._id, "Assigning Task Template : " + tasks.templateName + " to  : " + _id);
            // Log.update(_id, "A Task Template is assigned by " + req.employee.firstName + " " + req.employee.lastName);
            res.status(200).send({ "status": "Successfully assigned the task template" });
        }
		
	});

});

router.put('/assignQuizQuestion', authenticateHR, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Assign Quiz Question");

	var _id = req.body.employeeId;
	var questionId = req.body.questionId;

	Question.findById(questionId, function (err, question) {

		if (!question) {
            res.status(400).send({'status': 'Error assigning question to employee. Question does not exist.', 'Error': err});
		}
		else {

			var body = {
				"task": question,
				"status": "open",
				"startDate": req.body.startDate,
				"dueDate": req.body.dueDate

			};

			console.log(body);

			Employee.findByIdAndUpdate(_id,
				{ $push: { "questions": body } },
				{ safe: true, upsert: true },
				function (err, model) {
					if (err) {
                        res.status(400).send({'status': 'Error assigning question to employee. Please try again.', 'Error': err});
					}
					else {
						Log.updateLog(req.employee._id,"Assiging Quiz Question: " + quiz.quizName + " to the user : " + model.firstName + " " + model.lastName);
						Log.updateLog(_id,"A new question is assigned by " + req.employee.firstName + " " +req.employee.lastName);
						res.send({ "status": "successfully assigned the question" });
					}

				});
		}

	});

});

router.put('/assignQuizTemplate', authenticateHR, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Assign Quiz Template");

	var _id = req.body.empId;
	var quizId = req.body.quizId;
	var override = req.body.override;
    var assign = true;
    
	Employee.findById(_id).then((employee) => {

        if(override == 'override'){
            assign = true
        }
        else if(override == null){
            for(var i = 0; i < employee.quizzes.length; i++){
                if(quizId == employee.quizzes[i].task._id){
                    console.log("we come here because override is not specified");

                    console.log("found duplicate quiz");
                    if(override == null){
                        console.log("Overriding the duplicate still");
                        assign = false;
                    
                    }
                    break;
                }
            }    
        }else{
            assign = false
        }
		

		if(assign){
			console.log("Assigning the quiz template now");
			Quiz.findById(quizId, function (err, quiz) {
	
				if (!quiz) {
                    res.status(400).send({'status': 'Error assigning quiz to employee. Quiz does not exist.', 'Error': err});
				}
				else {

					var taskBody = {
						//                "taskId":todoId,
						"status": "open",
						"startDate": new Date(req.body.startDate),
						"dueDate": new Date(req.body.dueDate),
						"endDate": new Date(req.body.endDate) || new Date(req.body.dueDate),
						"title": quiz.quizName,
						"instructions": "Take the Quiz from the quiz section.",
						"rewardPoints": quiz.rewardPoints,
						"color": '#696969',
						"duration": quiz.duration,
						"url": 'N/A',
						"type": 'Quiz',
						"isComplete" : 'Incomplete',
						"priority": 'High',
						"category": 'Taking a Quiz',
						"location":"Any",
						"division":"Any",
						"department":"Any",
						"inputs" : {
							value : 'false',
							name : "Finished this quiz",
						}
						
					};
		
					var body = {
						"quiz": quiz,
						"status": "open",
						"startDate": req.body.startDate,
						"dueDate": req.body.dueDate,
						"timeLeft" : quiz.timeInMinutes
					};
					//console.log(body);
		
					Employee.findByIdAndUpdate(_id,
						{ $push: { "tasks": taskBody, "quizzes": body } },
						{ safe: true, upsert: true },
						function (err, model) {
							if (err) {
								res.status(400).send({'status': 'Error assigning quiz as a task to employee.', 'Error': err});
							}
							else {
								Log.updateLog(req.employee._id,"Assiging todo task: " + taskBody.title + " to the user : " + model.firstName + " " + model.lastName);
								Log.updateLog(_id,"A new todo is assigned by + " + req.employee.firstName + " " +req.employee.lastName);
								Log.updateLog(req.employee._id,"Assiging Quiz: " + quiz.quizName + " to the user : " + model.firstName + " " + model.lastName);
								Log.updateLog(_id,"A new quiz is assigned by + " + req.employee.firstName + " " +req.employee.lastName);
								
								res.status(200).send({ "status": "Successfully assigned the quiz" });
							}	
						}
					);					
				}		
			});
	
		}else{
            res.status(401).send({"status": "Needs override", 'Error': 'Quiz already exists for the user. Please override while assigning.'});
		}

	});

});

module.exports = router;