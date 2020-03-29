var router = require("express").Router();
const request = require('request');
const Parser = require('./Parser/newParser')

router.get("/", function (req, res) {
	res.render("index.ejs");
})

router.post("/parse",async function(req, res){
    var sms = {
        "customer_id": req.body.custID,
        "sender": req.body.sender,
        "sender_timestamp": req.body.date,
        "sender_message": req.body.message
      }
    
  
      await Parser.parse()
      console.log(Parser)
    
    
    
    
    res.send("Complete")
})  

module.exports = router;
