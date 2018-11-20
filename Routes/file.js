const csvFilePath = 'uploads/data.csv'
const csv = require('csvtojson');
var express = require("express")
var router = express.Router()

var multer = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });
var finalResult = false;

router.post("/upload", upload.array("uploads[]", 12), function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");	
	
  csv().fromFile(csvFilePath).then((jsonObj) => {
			message = processCsvFile(jsonObj);
			console.log(message);
			var response = { 'custMessage' : message };
			if(finalResult)
			{
				res.status(200).send(response)
			}
			else
			{
				res.status(400).send(response)
			}
    })
});


var result = "";
var minorError = true;
var majorError = true;
var questionJsonArray = [];
var questionJson = {};

function processCsvFile(jsonArrayItems) {
    questionJsonArray = [];
    
    minorError = true;
    majorError = true;
    result = "";

    var i = 0;
    for (i = 0; i < jsonArrayItems.length; i++) {
        validateQuestionJson(jsonArrayItems[i], (i + 1))
        if (majorError == false) {
            break;
        }
    }

    if (majorError && minorError) {
        for (i = 0; i < jsonArrayItems.length; i++) {
			questionJson = {};
            buildQuestionJson(jsonArrayItems[i])
            questionJsonArray.push(questionJson);
        }
		finalResult = true;
		return questionJsonArray;
    }
    else {
		finalResult = false;
		return (result);
    }
}

function buildQuestionJson(obj) {

    var problemJson = {};
    problemJson['question'] = obj['question'];
    var optionArray = [];
    optionArray.push(obj['option1']);
    optionArray.push(obj['option2']);
    optionArray.push(obj['option3']);
    optionArray.push(obj['option4']);
    problemJson['options'] = optionArray;
    problemJson['points'] = obj['points'];
    problemJson['typeOfQuestion'] = obj['typeOfQuestion'];
    questionJson['problem'] = problemJson;
    questionJson['answer'] = obj['answer'].split(";");
    questionJson['location'] = obj['location'];
    questionJson['division'] = obj['division'];
    questionJson['department'] = obj['department'];

}

function validateQuestionJson(jsonItem, row) {
    if (jsonItem.hasOwnProperty('question')) {
        question = jsonItem['question'];
        if (question.trim() == "") {
            result = result + "\nQuestion field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nQuestion column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('option1')) {
        option1 = jsonItem['option1'];
        if (option1.trim() == "") {
            result = result + "\nOption1 field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nOption1 column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('option2')) {
        option2 = jsonItem['option2'];
        if (option2.trim() == "") {
            result = result + "\nOption2 field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nOption2 column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('option3')) {
        option3 = jsonItem['option3'];
        if (option3.trim() == "") {
            result = result + "\nOption3 field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nOption3 column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('option4')) {
        option4 = jsonItem['option4'];
        if (option4.trim() == "") {
            result = result + "\nOption4 field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nOption4 column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('answer')) {
        answer = jsonItem['answer'];
        if (answer.trim() == "") {
            result = result + "\nAnswer field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nAnswer column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('typeOfQuestion')) {
        typeOfQuestion = jsonItem['typeOfQuestion'];
        if (typeOfQuestion.trim() == "") {
            result = result + "\nType Of Question field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nType Of Question column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('points')) {
        points = jsonItem['points'];
        if (points.trim() == "") {
            result = result + "\nPoints field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nPoints column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('location')) {
        location = jsonItem['location'];
        if (location.trim() == "") {
            result = result + "\nLocation field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nLocation column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('division')) {
        division = jsonItem['division'];
        if (division.trim() == "") {
            result = result + "\nDivision field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nDivision column is missing";
        majorError = false;
    }
    if (jsonItem.hasOwnProperty('department')) {
        department = jsonItem['department'];
        if (department.trim() == "") {
            result = result + "\nDepartment field is empty in row ;" + row;
            minorError = false;
        }
    }
    else {
        result = result + "\nDepartment column is missing";
        majorError = false;
    }
}

module.exports = router;