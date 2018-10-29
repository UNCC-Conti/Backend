var express = require('express');
var router = express.Router();
var _ = require('lodash');
var { authentication } = require('./../middleware/authentication');
var { authenticateEmployee } = require('./../middleware/authenticationEmployee');
var { authenticateHR } = require('./../middleware/authenticationHR');

const { mongoose } = require('./../dbConfig/mongoose');

var { Employee } = require('./../models/employeeModel');
var { Interest } = require('./../models/interestModel');
var { Task } = require('./../models/taskModel');
var { Question } = require('./../models/questionModel');
var { TaskTemplate } = require('./../models/taskTemplateModel');
var { Quiz } = require('./../models/quizModel');

var { Log } = require('./../models/logModel');
var { Loc } = require('./../models/locationModel');

router.get('/',function(req,res){
	res.send('Devansh Test!');
});

router.post('/employee', function (req, res) {

	var d = new Date()
	console.log(d + '\tExecuting API : Create Employee')

	var body = _.pick(req.body, ['employeeId', 'firstName', 'middleName', 'lastName',
								 'email', 'password', 'mobilePhone', 'workPhone',
								 'jobTitle', 'reportTo', 'permissions', 'authorizations', 
								 'location', 'departments', 'divisions'])
	
	
	var employee = new Employee(body)

	employee.save().then(() => {
		employee.password = 'xxxxx'
		console.log(d + '\tSuccessful admin creation for : ' +employee.firstName + ' ' + employee.lastName + '\n')

		Log.createLog(employee._id, employee.employeeId, employee.firstName, employee.lastName)
		var result = {  'id' : employee._id,
						'firstName' :employee.firstName,
						'lastName' : employee.lastName,
						'email' : employee.email }

		res.status(201).send(result)

	}).catch((error) => {

		console.log(d + '\tAdmin Creation Failed\n' + error)
		var result = { 'error' : error }
		res.status(400).send(result)
	})
});

router.post('/location', (req, res) => {

	var d = new Date()
	console.log(d + '\tExecuting API : Adding a new Location')
    // Log.updateLog(req.admin._id,'Adding a new location : ' + req.body.locationName);
 
	var body = _.pick(req.body, ['locationName'])
	var loc = new Loc(body)

	loc.save().then((result) => {

		console.log(d + '\tSuccessfully added the location\n')
		res.status(201).send(result)
	}, (error) => {
		console.log(d + '\tERROR : ' + error + '\n')
		res.status(400).send(error)
	});


});

router.post('/department', (req, res) => {

	var d = new Date()
	console.log(d + '\tExecuting API : Adding a new Department')
	console.log(d + '\tThe Location is : ' + req.body.locationName + '\tThe Department is : ' + req.body.departmentName)

	var departmentName = req.body.departmentName

	Loc.findOne({locationName: req.body.locationName}).then((loc) => {

		// Log.updateLog(req.admin._id,'Adding a new Department : ' + departmentName);

		if(loc){
			Loc.update({'locationName': req.body.locationName},
			{$addToSet: {'departments' : {'departmentName':departmentName}}},
			function (err, model) {
	
				if (err) {
					console.log(d + '\tERROR : ' + err + '\n')
					res.status(400).send(err)
				}
				else {
					if (!model){
						console.log(d + '\tERROR : Could not add the department\n')
						res.status(400).send({ 'status': 'Invalid Error!!' })
					}else{
						console.log(d + '\tDepartment succesfully added\n')
						res.status(201).send({ 'status': 'success' })
					}
				}
			});
		}else{
			res.status(400).send({ 'status': 'Location name does not exists' })
		}

		
	}, (e) => {
		console.log(d + '\tERROR : '+ err + '\n')
		res.status(400).send(e)
	})
});

router.post('/division', (req, res) => {

	var divisionName = req.body.divisionName;
	// Log.updateLog(req.admin._id,'Adding a new Department : ' + divisionName);
	var d = new Date()
	console.log(d + '\tExecuting API : Adding a new Division')

	Loc.findOne({locationName: req.body.locationName}).then((loc) => {

		if(loc){

			Loc.update({'locationName': req.body.locationName},
			{$push: {'divisions' : {'divisionName':divisionName}}},
			function (err, model) {

				if (err) {
					console.log(d + '\tERROR : ' + err + '\n')
					res.status(400).send(err)
				}
				else {
					if (!model){
						console.log(d + '\tERROR : Could not add the division\n')
						res.status(400).send({ 'status': 'Invalid Error!!' })
					}else{
						console.log(d + '\tDivision succesfully added\n')
						res.status(201).send({ 'status': 'success' })
					}
				}
			})
		}else{
			res.status(400).send({ 'status': 'Location name does not exists' })
		}
	}, (e) => {
		console.log(d + '\tERROR : '+ err + '\n')
		res.status(400).send(e)
	})
});

/* TODO: 
    API name: /events
    this api will create an event for the logged in person's events only
*/

//API to post an Interests
router.post('/interest', authenticateEmployee, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create Interest')


	var body = _.pick(req.body, ['interest', 'category'])
	Log.updateLog(req.employee._id,'Creating an interest : ' + req.body.interest)

	if(body.category == null){
		body.category = 'Other'
	}
	var interest = new Interest(body)

	interest.save().then((doc) => {
		res.status(201).send({'status': 'Successfully added interest', 'interest' : doc})
	}, (e) => {
		res.status(400).send({ 'status': 'Invalid Error!! ','error' : e })
	})
})

router.post('/task', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create a todo task')
    Log.updateLog(req.employee._id,'Creating a new todo.')

	var body = _.pick(req.body, ['instructions', 'rewardPoints', 'priority', 'duration', 'url', 'inputs',
								'color', 'category', 'title', 'type', 'location', 'department','division'])

	var toDo = new Task(body)
	console.log("we come here 0")

	toDo.save().then((todo) => {

		console.log("we come here 1")
		res.status(201).send({'status': 'Successfully Created todo', 'todo': todo})
	
	}, (e) => {
		console.log("we come here 2")
		res.status(400).send({'status':'Error Creating the todo', 'Error': e})
	})

	console.log("we come here 4")

})

router.post('/taskTemplate', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create Task Template')
    Log.updateLog(req.employee._id,'Creating a new task template.')

	var body = _.pick(req.body, ['templateName', 'createdBy', 'createdUserRole', 'templateDescription',
								'assignedRoleId', 'assignedDepartmentId'])


	var taskTemplate = new TaskTemplate(body)

	taskTemplate.save().then((doc) => {
		res.status(201).send({'result':'Successfully created task template', 'taskTemplate':doc})
	}, (e) => {
		res.status(400).send({'status':'Error Creating the todo', 'Error': e})
	})

})

router.post('/quizQuestion', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Creating Quiz Question')
    Log.updateLog(req.employee._id,'Adding a new quiz question.')

	var body = _.pick(req.body, ['problem', 'answer', 'location', 'department', 'division'])
	
	var quizQuestion = new Question(body)

	quizQuestion.save().then((doc) => {
		res.status(201).send({'result':'Successfully created quiz question', 'question':doc})
	}, (e) => {
		res.status(400).send({'status':'Error Creating the quiz question', 'Error': e})
	})
})

router.post('/quizTemplate', authenticateHR, function (req, res) {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Create Quiz Template')
    Log.updateLog(req.employee._id,'Adding a new quiz template.')

	var body = _.pick(req.body, ['quizName', 'quizDescription', 'rewardPoints', 'timeInMinutes', 'numberOfAttempts',
						'threshold', 'referenceDocId', 'location', 'department', 'division', 'duration'])

	var quizTemplate = new Quiz(body)

	quizTemplate.save().then((doc) => {
		res.status(201).send({'result':'Successfully created quiz template', 'quizTemplate':doc})
	}, (e) => {
		res.status(400).send({'status':'Error Creating the quiz question', 'Error': e})
	})
})

module.exports = router;