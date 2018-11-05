var mongoose = require('mongoose');
var { Question } = require('./../models/questionModel');

var quizSchema = new mongoose.Schema({

    quizName : {
        type : String,
        required : true,
        minlength : 1,
        trim : true
    },
    quizDescription : {
        type : String,
        minlength : 1,
        trim : true
    },
    active : {
        type : Boolean,
        default : true
    },
    timeInMinutes : {
        type : Number,
        default : 60
    },
    rewardPoints : {
        type : Number,
        default : 0
    },
    threshold : {
        type : Number,
        default : 60
    },
    currentProgress : {
        type : Number,
        default : 0
    },
    duration : {
        type : String,
        default : 0,
        trim : true
    },
 
    questions : [{
        question : {
            type : Object,
            required : true
        },
        answer : {
            type : Object,
            required : true
        },
    }],

    responses : {
        type : Array,
        default : []
    },
    score : {
        type : Number,
        default : 0
    },
    attemptNumber: {
        type : Number,
        default : 0
    },
    numberOfAttempts : {
        type: Number, 
        default: 1
    },
    referenceDocId : String,

    location : String,
    department : String,
    division : String

});

//This method is wrong. Just to check the completion of USER.
quizSchema.methods.calculateCompletion = function () {
    var quiz = this;
    quiz.currentProgress = quiz.responses.length * 100 / quiz.questions.length;
}

quizSchema.methods.gradeQuiz = function () {
    var quiz = this;
    var correctAnswers = 0;
    for(var i = 0; i < quiz.responses.length; i++){
        if(quiz.questions.question[quiz.responses[i].questionNumber] == quiz.responses[i].answer){
            correctAnswers++;
        }
    }
    quiz.score = correctAnswers*100/quiz.questions.length;
}


var Quiz = mongoose.model('Quizzes', quizSchema);

module.exports = { Quiz };
