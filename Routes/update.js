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
router.post('/taskTemplate', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create Task Template')
    Log.updateLog(req.employee._id,'Creating a new task template.')

	var taskTemplate = req.body.taskTemplate

	TaskTemplate.update(
		{ _id : taskTemplate._id }, 
		{
			'$set': { 'templateName' : ''}
		}
		).then((doc) => {
		res.status(201).send({'result':'Successfully updated task template', 'taskTemplate':doc})
	}, (e) => {
		res.status(400).send({'status':'Error Creating the todo', 'Error': e})
	})

})
	
router.post('/copyTaskTemplate', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create Task Template')
    Log.updateLog(req.employee._id,'Creating a new task template.')

	var templateBody = req.body.taskTemplate
	delete templateBody['_id']
	delete templateBody['__v']
	templateBody.templateName = 'copy of' + req.body.taskTemplate.templateName

	var taskTemplate = new TaskTemplate(templateBody)

	taskTemplate.save().then((doc) => {
		res.status(201).send({'result':'Successfully updated task template', 'taskTemplate':doc})
	}, (e) => {
		res.status(400).send({'status':'Error Creating the todo', 'Error': e})
	})

})
/* TODO: 
    API name: /addTaskToTaskTemplate
    this api will get a old expired token and will return a new updated token in response
*/
// API to assign a task to a task Template
router.put('/addTaskToTaskTemplate', authenticateHR, function (req, res) { 

	var d = new Date(); 
	console.log("" + d + "\tExecuting API : Add task to task template");

	var taskTemplateId = req.body.taskTemplateId;
	var todoTaskId = req.body.taskId;
	if (!taskTemplateId)
		res.status(400).send({ 'status': 'Invalid Task Template Id' });


	Task.findById(todoTaskId, function (err, task) {

		if (err) {
			res.status(400).send(err);
		}
		if (!task) {

			res.status(400).send({ 'status': 'Invalid Task Id' });
		}
		else {

			var body = {
				"task": task,
				"active": "true"
			};

			TaskTemplate.findByIdAndUpdate(taskTemplateId,
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

							TaskTemplate.findByIdAndUpdate(taskTemplateId, 
								{ $set: { "duration": currentDuration + parseInt(body.task.duration)}},
								
								function (err, taskTemplate) {

									if (!taskTemplate)
										res.status(400).send({ "status": "Invalid Task Template Id" });
									else {
										Log.update(req.employee._id, "Adding task : " + todoTaskId + " to template : " + taskTemplateId);
										res.status(200).send({ "status": "success" });
									}

							});				
							

						}
					}

				});
		}

	});
})

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