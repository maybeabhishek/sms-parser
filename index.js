var express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var rootRoute = require('./root.js');

var app = express();

// =================
// App configuration
// =================
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// =================
// Connect Database
// =================
console.log("Connecting to database...");
mongoose.connect('mongodb://localhost:27017'); 
console.log("Connected to database!");


// =================
// All routes
// =================
app.use(rootRoute);

// =================
// Server Configurations
// =================
app.listen(process.env.PORT || 8000, process.env.IP, function(){
	console.log("Server is running");
}); 
