var router = require("express").Router();
const request = require('request');


router.get("/", function (req, res) {
	res.render("index.ejs");
})

module.exports = router;
