const express= require('express');
const _= require('lodash');
const bodyParser=require('body-parser');
var cors = require('cors'); 
const {mongoose} = require('./dbConfig/mongoose');

var app=express(); 
app.use(bodyParser.json());
app.use(cors());
const port=process.env.PORT || 5800; 

var createRoutes = require("./Routes/create");
var removeRoutes = require("./Routes/remove");
var updateRoutes = require("./Routes/update");
var getRoutes = require("./Routes/get");
var employeeRoutes = require("./Routes/employee");
var assignRoutes = require("./Routes/assign");

app.use("/create",createRoutes);
app.use("/remove",removeRoutes);
app.use("/get",getRoutes);
app.use("/update",updateRoutes);
app.use("/employee",employeeRoutes);
app.use("/assign", assignRoutes);

app.get("/",function(req,res){
    res.status(200).send("Server is Online!");
});

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(port,function(){

    console.log('Server started at Port No: '+port);

});