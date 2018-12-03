var express = require("express")
var router = express.Router()
var _ = require('lodash')
var { authentication } = require('./../middleware/authentication')
var { authenticateEmployee } = require('./../middleware/authenticationEmployee');
var { authenticateHR } = require('./../middleware/authenticationHR');

const { mongoose } = require('./../dbConfig/mongoose')
var { Employee } = require('./../models/employeeModel')
var { Interest } = require('./../models/interestModel')
var { Task } = require('./../models/taskModel');
var { Question } = require('./../models/questionModel');
var { TaskTemplate } = require('./../models/taskTemplateModel');
var { Quiz } = require('./../models/quizModel');
var { Log } = require('./../models/logModel')

router.get('/employee', authentication, function (req, res) {

    var id = req.header('employeeId')

    console.log("We are calling the get Employee API. ")

    Employee.findOne({'employeeId' : id}, function (err, employee) {

        if (!employee){
            var result = { 'error' : "Could not find the Employee with the given ID" }
            res.status(400).send(result)
        }else{
            var result = employee
            res.status(200).send(result)
        }
            
    })
})

router.get('/dashInfo', authenticateHR, function (req, res) {

    // var id = req.header('employeeId');

    console.log("We are calling the get Employee API. ")

    Employee.find().then((employees) => {

        if (!employees){
            var response = { 'error' : "Could not find Employees" }
            res.status(400).send(response)
        }else{
            var response = []
            for(var i = 0; i < employees.length;i++){ 
				response.push({}) 
			}

			for(var i = 0; i < employees.length;i++){
				response[i].jobTitle = employees[i].jobTitle
				// response[i].reportTo = employees[i].reportTo
				// response[i].isPeerBuddy = employees[i].isPeerBuddy
				response[i]._id = employees[i]._id
				response[i].firstName = employees[i].firstName
				response[i].lastName = employees[i].lastName
				// response[i].email = employees[i].email
				// response[i].workPhone = employees[i].workPhone
				response[i].totalTasks = employees[i].tasks.length
				var completedTasks = 0
				var overDueTasks = 0

				for(var j = 0; j < employees[i].tasks.length; j++){
					if(employees[i].tasks[j].status == "Complete"){
						completedTasks = completedTasks + 1
					}else{
						var dueDate = new Date(employees[i].tasks[j].dueDate) 
						var currentDate = new Date()
						if(currentDate > dueDate){
							overDueTasks = overDueTasks + 1
						}
					}
				}
				response[i].completedTasks = completedTasks

				// if(overDueTasks != 0)
				response[i].overDueTasks = overDueTasks

				if(employees[i].tasks.length != 0)
					response[i].progress = completedTasks*100.0/employees[i].tasks.length
				else{
					response[i].progress = 100
				}
			}
	
            res.status(200).send(response)
        }
            
    })
})

router.get('/employeeDashInfo', authenticateHR, function (req, res) {

    // var id = req.header('employeeId');

	console.log("We are calling the get Employee API. ")
	var id = req.header('empId')

    Employee.findOne({'_id' : id}).then((employee) => {

        if (!employee){
            var response = { 'error' : "Could not find Employees" }
            res.status(400).send(response)
        }else{
            var response = {}
			response.jobTitle = employee.jobTitle
			response._id = employee._id
			response.firstName = employee.firstName
			response.lastName = employee.lastName

			var tasks = []

			var doneTasks = 0
			var overDueTasks = 0

			for(var j = 0; j < employee.tasks.length; j++){

				tasks.push({}) 
				tasks[j].title = employee.tasks[j].title
				tasks[j].status = employee.tasks[j].status
				tasks[j].priority = employee.tasks[j].priority
				tasks[j].taskId = employee.tasks[j]._id
				tasks[j].inputs = employee.tasks[j].inputs

				if(employee.tasks[j].status == "Complete"){
					doneTasks = doneTasks + 1
				}else{
					var dueDate = new Date(employee.tasks[j].dueDate) 
					var currentDate = new Date()
					if(currentDate > dueDate){
						overDueTasks = overDueTasks + 1
					}
				}
			}
			console.log(JSON.stringify(response))
			response.completedTasks = doneTasks
			response.overDueTasks = overDueTasks
			response.progress = doneTasks*100.0/employee.tasks.length
			response.tasks = tasks

			var quizzes = []
			for(var j = 0; j < employee.quizzes.length; j++){

				var totalScore = 0
				for(var i = 0; i < employee.quizzes[j].quiz.questions.length; i++){
					totalScore = totalScore + employee.quizzes[j].quiz.questions[i].question.points
				}
				quizzes.push({}) 
				quizzes[j].title = employee.quizzes[j].quiz.quizName
				quizzes[j].status = employee.quizzes[j].status
				quizzes[j].numberOfAttempts = employee.quizzes[j].quiz.numberOfAttempts
				quizzes[j].attemptsMade = employee.quizzes[j].quiz.attemptNumber
				quizzes[j].scorePercent = employee.quizzes[j].quiz.score*100.0/totalScore

			}
			response.quizzes = quizzes
            
            res.status(200).send(response)
        }
            
    })
})

router.get('/listEmployees', authentication, function (req, res) {

    // var id = req.header('employeeId');

    console.log("We are calling the get Employee API. ")

    Employee.find().then((employees) => {

        if (!employees){
            var response = { 'error' : "Could not find Employees" }
            res.status(400).send(response)
        }else{
            var response = []
            for(var i = 0; i < employees.length;i++){ response.push({}) }

            switch(req.access.toUpperCase()) {

                case 'ADMIN':
                    response = employees
                    break;
                case 'HRBP':
                    for(var i = 0; i < employees.length;i++){
                        response[i].jobTitle = employees[i].jobTitle
                        response[i].reportTo = employees[i].reportTo
						response[i].isPeerBuddy = employees[i].isPeerBuddy
						response[i]._id = employees[i]._id
                    }
                case 'EMPLOYEE':
                    for(var i = 0; i < employees.length;i++){
                        response[i].firstName = employees[i].firstName
                        response[i].lastName = employees[i].lastName
                        response[i].email = employees[i].email
                        response[i].workPhone = employees[i].workPhone
                    }
            }
            res.status(200).send(response)
        }
            
    })
})

router.get('/profile', authenticateEmployee, function(req,res){
    
    Log.updateLog(req.employee._id,'Viewing the profile')

	var employee = req.employee
	if (!employee) {
		res.status(400).send(err)
	} else {
		res.status(200).send(employee)
	}
	
});

router.get('/testing', function (req, res) {
    var id = req.header('employeeId')

    Employee.findOne({'employeeId' : id}).then((employee) => {

        console.log('Employee Permissions : ' + JSON.stringify(employee.per))

        if(employee.permissions.indexOf(req.header('accessLevel')) > -1){
            res.status(200).send(req.header('accessLevel') + ' access granted')
        }else{
            res.status(401).send('Unauthorized to access ' + req.header('accessLevel') + ' priveledges')
        }
    })
})

router.get('/getLocations', authenticateEmployee, (req, res) => {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Listing all Locations')

	Loc.find({}, {locationName:1, _id:0}).then((loc) => {
		console.log(d + '\t' + 'Sending all Locations\n')
		res.status(200).send( {locations: loc })
	}, (e) => {
		console.log(d + '\t' + 'ERROR : ' + e + '\n')
		res.status(400).send(e)
	});
});

router.get('/getDepartments', authenticateEmployee, (req, res) => {

	var d = new Date()	
	console.log('' + d + '\tExecuting API : Listing all Departments')

	Loc.findOne({locationName: req.header('locationName')}).then((loc) => {
		console.log(d + '\t' + 'Sending all Departments\n')
		res.status(200).send(loc.departments)
	}, (e) => {
		console.log(d + '\t' + 'ERROR : ' + err + '\n')
		res.status(400).send(e)
	});

});

router.get('/getDivision', authenticateEmployee, (req, res) => {

	var d = new Date()
	console.log('' + d + '\tExecuting API : Listing all Divisions')

	Loc.findOne({locationName: req.header('locationName')}).then((loc) => {
		console.log(d + '\t' + 'Sending all Divisions\n')
		res.status(200).send(loc.divisions)
	}, (e) => {
		console.log(d + '\t' + 'ERROR : ' + err + '\n')
		res.status(400).send(e)
	});

});


router.get('/interests', authenticateEmployee,function(req,res){

    Log.updateLog(req.employee._id,"Viewing the Interests")

    var filter = {}
    console.log("The header sent is : " + req.header('categories'))
    // var filter = {'category' : req.header('categories')}

    Interest.find(filter,{interest: 1, category: 1, _id:0}).then((interests) => {
        res.status(200).send(interests)
    },(e) =>{
        res.status(400).send(e)
    });
    
    
});

router.get('/myInterests', authenticateEmployee,function(req,res){

    Log.updateLog(req.employee._id,"Viewing my Interests");
    res.status(200).send(req.employee.interests)

});

/* TODO: 
    API name: /match
    this api will return the list of matched peerbuddy for the logged in person
*/

router.get('/taskTemplates', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List question bank")

	TaskTemplate.find({},{todoTasks: 0}).then((taskTemplates) => {
		res.status(200).send({taskTemplates})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the task templates', 'Error': e})

	})
})

router.get('/taskTemplate', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List question bank")
	var id = req.header("taskTemplateId")

	TaskTemplate.find({"_id":id}).then((taskTemplate) => {
		res.status(200).send({taskTemplate})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the task templates', 'Error': e})

	})
})
router.get('/tasks', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List question bank")

	Task.find().then((tasks) => {
		res.status(200).send({tasks})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the tasks', 'Error': e})

	})
})

router.get('/employeeTasks', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List assigned task of the user")
    var id = req.param("empId")
	console.log("empid = " + id)
    Employee.find({"_id":id}, {tasks:1, _id:0}).then((tasks) => {

		Log.updateLog(id, "Viewing the assigned tasks")
		res.status(200).send(tasks[0]);
    }, (e) => {
		res.status(400).send({'status': 'Error getting all the Tasks for the employee', 'Error': e})
	})
})


router.get('/assignedQuizzes', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List assigned quiz")
    var id = req.header('employeeId');

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
				timeLeft: quizzes[0].quizzes[i].timeLeft

			};
			response.push(body);
		}
		Log.updateLog(id, "Viewing the assigned quizzes")
		res.status(200).send({"quizzes":response});
    }, (e) => {
		res.status(400).send({'status': 'Error getting all the quizzes for the employee', 'Error': e})
	})
})


router.get('/quizQuestions', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: List question bank")

	Question.find().then((questions) => {
		res.status(200).send({questions})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the questions', 'Error': e})

	})
})

router.get('/quizzes', authenticateHR, function (req, res) {

	var d = new Date()
	console.log("" + d + "\tExecuting API: View all Quizzes")

	Quiz.find().then((quizzes) => {
		res.status(200).send({quizzes})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the quizzes', 'Error': e})
	})
})

router.get('/quiz', authenticateEmployee, function (req, res) {

	var quizId = req.header("quizId")
	var d = new Date()
	console.log("" + d + "\tExecuting API: View Quiz")

	Quiz.find({"_id":quizId}, {problem:1, answer:1, _id:0}).then((quizzes) => {

		res.status(200).send({quizzes})
	}, (e) => {
		res.status(400).send({'status': 'Error getting all the quizzes', 'Error': e})
	})
})

router.get('/viewQuiz',authenticateEmployee,function(req,res){

	var quizId = req.header('quizId');


	Employee.find({"_id":req.employee._id, "quizzes._id": quizId },function(err,employee){
        
        if(!employee){
			res.status(400).send(err); 
		}
        else{

			if(employee.length > 0){
				// console.log(employee[0].quizzes)
				var response = [];
				for(var i = 0; i < employee[0].quizzes.length;i++){

					if(employee[0].quizzes[i]._id == quizId){
						
						for(var j = 0; j < employee[0].quizzes[i].quiz.questions.length;j++){

							response.push(employee[0].quizzes[i].quiz.questions[j].question);

						}

						console.log("Responses are : " + employee[0].quizzes[i].response)
						Log.updateLog(req.employee._id, "Viewing a particular quiz with id " + quizId)
						res.status(200).send({"questions":response, "responses" : employee[0].quizzes[i].quiz.responses});
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

module.exports = router;