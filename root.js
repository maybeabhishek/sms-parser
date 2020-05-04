var router = require("express").Router();
const request = require('request');
const Parser = require('./Parser/newParser')

router.get("/", function (req, res) {
	res.render("index.ejs",json={message: "", pattern:""});
})

router.post("/parse", function(req, res){
    var sms = {
        "customer_id": req.body.custID,
        "sender": req.body.sender,
        "sender_timestamp": req.body.date,
        "sender_message": req.body.message
      }
    Parser.parse(sms).then(r =>  {
      console.log(r);
      res.render("index.ejs",json=r);
    });
    
    // setTimeout(function(){res.send(Parser)},2000);
    // console.log(r);
    // res.send("Complete")

})

router.post("/api/parse", function(req, res){
  var sms = {
      "customer_id": req.query.custID,
      "sender": req.query.sender,
      "sender_timestamp": req.query.date,
      "sender_message": req.query.message
    }
  Parser.parse(sms).then(r =>  {
    // console.log(r);
    res.send(r);
  });
  
  // setTimeout(function(){res.send(Parser)},2000);
  // console.log(r);
  // res.send("Complete")

})

router.post("/api/add/regex", function(req, res){
  // Parser.addNewRegex(regex);
  res.send("TODO");
})

router.post("/api/message/check", function(req, res){
  var sms = {
    "customer_id": req.query.custID,
    "sender": req.query.sender,
    "sender_timestamp": req.query.date,
    "sender_message": req.query.message
  }
  // console.log(sms);
  
  Parser.getMatchedPattern(sms).then(r=>{
    res.send(r);
  })
})


router.get("/docs", function(req, res){
  res.render("docs.ejs");
});

module.exports = router;
