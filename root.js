var router = require("express").Router();
const request = require('request');


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
    console.log(sms)
    res.send("ASdsad")
})

module.exports = router;
