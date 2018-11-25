var express = require("express");
var router = express.Router();
var _ = require('lodash');
const { mongoose } = require('./../dbConfig/mongoose');

var { authentication } = require('./../middleware/authentication')
var { authenticateEmployee } = require('./../middleware/authenticationEmployee')
var { authenticateHR } = require('./../middleware/authenticationHR');

var { Task } = require('./../models/taskModel');
var { Question } = require('./../models/questionModel');
var { TaskTemplate } = require('./../models/taskTemplateModel');
var { Quiz } = require('./../models/quizModel');

var { Employee } = require('./../models/employeeModel');
var { Log } = require('./../models/logModel');




/* TODO: 
    API name: /updateToken
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /updateNewHireFlag
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /updateNewHireOtherInfo
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /updateNewHirePosition
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /todoTaskStatus
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /taskTemplate
    this api will get a old expired token and will return a new updated token in response
*/
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
	
/* TODO: 
    API name: /addTaskToTaskTemplate
    this api will get a old expired token and will return a new updated token in response
*/
// API to assign a task to a task Template
router.put('/addTaskToTaskTemplate', authenticate, function (req, res) { 

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Add task to task template");

	var _id = req.body.taskTemplateId;
	var todoTaskId = req.body.taskId;
	if (!_id)
		res.status(400).send({ 'status': 'Invalid Task Template Id' });


	Todo.findById(todoTaskId, function (err, task) {

		if (err) {
			res.status(400).send(err);
		}
		if (!todo) {

			res.status(400).send({ 'status': 'Invalid Task Id' });
		}
		else {

			var body = {
				"task": task,
				"active": "true"
			};

			TaskTemplate.findByIdAndUpdate(_id,
				{ $push: { "todoTasks": body}},  
				{ new: true },
				function (err, model) {
					if (err) {
						res.status(400).send(err);
					}
					else {
						if (!model)
							res.send({ "status": "Invalid Task Template Id" });
						else {
						//	model.duration = model.duration + model.todoTasks[model.todoTasks.length].task.duration;
							//console.log("duration of the todo task is now : " + model);
							//console.log("time to add + " + body.task.duration);
						
							var currentDuration = parseInt(model.duration);

							TaskTemplate.findByIdAndUpdate(_id, 
								{ $set: { "duration": currentDuration + parseInt(body.task.duration)}},
								
								function (err, taskTemplate) {

									if (!taskTemplate)
										res.status(400).send({ "status": "Invalid Task Template Id" });
									else {
										Log.update(req.admin._id, "Adding task : " + todoTaskId + " to template : " + _id);
										res.status(200).send({ "status": "success" });
									}

							});				
							

						}
					}

				});
		}

	});

});

/* TODO: 
    API name: /quizQuestion
    this api will get a old expired token and will return a new updated token in response
*/
router.put('/addQuizQuestion', authenticateHR, function (req, res) {

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Assign Quiz Question");

	var _id = req.body.quizId;
	var questionId = req.body.questionId;

	Question.find({"_id":questionId}, {problem:1, answer:1, _id:0}, function (err, question) {

		if (!question) {
            res.status(400).send({'status': 'Error assigning question to employee. Question does not exist.', 'Error': err});
		}
		else {


            var body = {
				"question": question[0].problem,
				"answer": question[0].answer
			};

            console.log("x : " + JSON.stringify(body))
            Quiz.findByIdAndUpdate(_id,
                { $push: { "questions": body } },
				{ new: true },
				function (err, model) {
					if (err) {
						res.status(400).send(err);
					}
					else {
						if (!model)
							res.send({ "status": "Invalid Quiz Id" });
						else{
                            Log.updateLog(req.employee._id,"Adding Quiz Question: " + question._id + " to the quiz : " + model._id);
							res.send({ "status": "success" });
						}
					}

                });
                

			// Employee.findByIdAndUpdate(_id,
			// 	{ $push: { "questions": body } },
			// 	{ safe: true, upsert: true },
			// 	function (err, model) {
			// 		if (err) {
            //             res.status(400).send({'status': 'Error assigning question to employee. Please try again.', 'Error': err});
			// 		}
			// 		else {
			// 			Log.updateLog(req.employee._id,"Assiging Quiz Question: " + quiz.quizName + " to the user : " + model.firstName + " " + model.lastName);
			// 			Log.updateLog(_id,"A new question is assigned by " + req.employee.firstName + " " +req.employee.lastName);
			// 			res.send({ "status": "successfully assigned the question" });
			// 		}

			// 	});
		}

	});

});

/* TODO: 
    API name: /quizTemplate
    this api will get a old expired token and will return a new updated token in response
*/

/* TODO: 
    API name: /addQuestionToQuizTemplate
    this api will get a old expired token and will return a new updated token in response
*/
module.exports = router;