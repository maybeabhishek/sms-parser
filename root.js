var router = require("express").Router();
const request = require('request');
const Parser = require('./Parser/newParser')

router.get("/", function (req, res) {
	res.render("index.ejs");
})

router.post("/parse", function(req, res){
    var sms = {
        "customer_id": req.body.custID,
        "sender": req.body.sender,
        "sender_timestamp": req.body.date,
        "sender_message": req.body.message
      }
    Parser.parse(sms)
    setTimeout(function(){res.send(Parser)},2000);
    
    // res.send("Complete")

})  

module.exports = router;
