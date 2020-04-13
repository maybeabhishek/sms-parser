
const MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
// const uri = "mongodb+srv://maybeabhishek:I_am_jok3r@cluster0-uoo2j.gcp.mongodb.net/qykly_dev?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db('qykly_dev').collection('biller_types');
//   collection.find({}).toArray(function(err,b){
//     //   console.log(err);
//       console.log(b);
//   },)
//   console.log(err)
//   client.close();
// });

var json = require('./Data/regexes.json');
var fs = require('fs');

//=========Unique Addresses in 

// var addressCount = []
// for(var i = 0; i<json.length; i++){
//   if(!(json[i].address in addressCount)){
//     addressCount[json[i].address] = 1
//   }
//   else
//   addressCount[json[i].address] += 1
// }

var uniqueMsgType = []
for (var i = 0; i < json.length; i++) {
  if (!(json[i].msgType in uniqueMsgType)) {
    uniqueMsgType[json[i].msgType] = 1
  }
}
// console.log(addressCount)

// var syntaxCategorized = {}

// syntaxCategorized["undefined"] = []
// for(var i = 0; i<json.length; i++){
//   // console.log(i+"\n");
//   if(!syntaxCategorized[json[i].msgType]){
//     syntaxCategorized[json[i].msgType] = [];
//   }
//   if(json[i].msgType===undefined || json[i].msgType.length < 1){
//     syntaxCategorized["undefined"].push(
//       {address: json[i].address,
//         msgType: json[i].msgType,
//         msgSubType: json[i].msgSubType,
//         merchantName: json[i].merchantName,
//         syntax: json[i].pattern
//       });
//   }
//   else{
//   syntaxCategorized[json[i].msgType].push(
//     {address: json[i].address,
//       msgType: json[i].msgType,
//       msgSubType: json[i].msgSubType,
//       merchantName: json[i].merchantName,
//       syntax: json[i].pattern
//     });
//   }
// }

// // console.log(uniqueMsgType)
// // console.log(syntaxCategorized)
// console.log(JSON.stringify(syntaxCategorized));
// fs.writeFile("./Data/Regex/regexCategorized.json", JSON.stringify(syntaxCategorized,null,4), (err) => {
//   if (err) {
//       console.error(err);
//       return;
//   };
//   console.log("File has been created");
// });


// console.log(Object.keys(templates))


var printMatchedPattern = function (message) {
  return new Promise(async (resolve, reject) => {
    try {

      let client = await MongoClient.connect((process.env.MONGO_URL || "mongodb://localhost:27017/"));
      var db = client.db("qykly_dev");

      let templates = await db.collection('regexes').find({}).toArray();
      console.log(templates.length);

      temp = _.groupBy(templates, function (temp) {
        return temp.address;
      })
      var msgTemplates = temp[(message.sender + "").split('-').pop().toUpperCase()] || [];
      // console.log(msgTemplates);

      for (var i = 0; i < msgTemplates.length; i++) {
        try {
          var msgTemplate = msgTemplates[i];
          const pattern = new RegExp(msgTemplate.pattern.replace('(?s)', ''), 'gim');
          // Pattern.compile(stringPattern, Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.UNIX_LINES);
          // var pattern = Pattern.compileSync(msgTemplate.pattern);
          // console.log(pattern);
          var matcher = pattern.exec(message.sender_message);
          if (matcher != null)
            console.log(matcher, msgTemplate);
        }
        catch (err) {
          console.log(err);
        }
      }
      client.close();
    }
    catch (err) {
      console.log(err);
      reject(err);
    }
  })
};

message = {
  "customer_id": 325170533,
  "sender": "AD-HDFCBK",
  "sender_timestamp": "2017-01-02 14:26:09",
  "sender_message": "ALERT: You've spent Rs.2007.40  on CREDIT Card xx7498 at DIGITALOCEAN COM on 2019-10-01:10:27:20.Avl bal - Rs.247344.60, curr o/s - Rs.52655.40.Not you? Call 18002586161."
}

// message = {
//   "customer_id": 325170533,
//   "sender": "BZ-SBIINB",
//   "sender_timestamp": "2017-01-02 14:26:09",
//   "sender_message": "Your a/c no. XXXXXXXX0791 is credited by Rs.10.00 on 21-12-16 by a/c linked to mobile 8XXXXXX000 (IMPS Ref no 635621846659)."
// }
printMatchedPattern(message);

var start = new Date().getTime();

regexObj = {
  pattern: "(?s)\\s*ALERT:\\s?You\\'ve\\s+spent\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+[CcRrEeDdiITt]+\\s+[CaCArRdD]+\\s+([xX0-9]+)\\s+at\\s+([a-zA-Z0-9.,-@\\s]+)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2}:\\d{2}:\\d{2}:\\d{2})\\.[AvlaVL]+\\s+[balanceBALANCE]+\\s+-\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+),\\s+curr\\s+o\\/s\\s+-\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).[NOTnot]+\\s+you\\?\\s+Call\\s+\\d+.*\\s?",
  posOutstanding: 6,
  dateModified: start,
  runawayCount: 2,
  posAvailableLimit: 5,
  posMerchant: 3,
  merchantName: "",
  bankName: "HDFC",
  posAmount: 1,
  posDate: 4,
  posMerchantAcountId: 2,
  paymentType: "credit-card",
  msgType: "debit-transaction",
  txnType: "regular",
  accountType: "credit-card",
  address: "HDFCBK",
  msgSubType: "expense",
  dateCreated: start,
  posAccountId: 2,

}



var addNewRegex = function (regexObj) {
  return new Promise(async (resolve, reject) => {
    try {

      let client = await MongoClient.connect((process.env.MONGO_URL || "mongodb://localhost:27017/"));
      var db = client.db("qykly_dev");

      let templates = await db.collection('regexes').insertOne(regexObj);
    }
    catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
// addNewRegex(regexObj);
pattern = "(?s)\\s*ALERT:\\s?You\\'ve\\s+spent\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+[CcRrEeDdiITt]+\\s+[CaCArRdD]+\\s+([xX0-9]+)\\s+at\\s+([a-zA-Z0-9.,-@\\s]+)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2}:\\d{2}:\\d{2}:\\d{2})\\.[AvlaVL]+\\s+[balanceBALANCE]+\\s+-\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+),\\s+curr\\s+o\\/s\\s+-\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).[NOTnot]+\\s+you\\?\\s+Call\\s+\\d+.*\\s?"

// pattern = '(?s)\\s*Your\\s+a/c\\s+no\\.\\s+([xX0-9]+)\\s+is\\s+credited\\s+by\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+(\\d{2}-\\d{2}-\\d{2})\\s+by\\s+a/c\\s+linked\\s+to\\s+mobile\\s+([xX0-9]+)\\s+\\(IMPS\\s+Ref\\s+no\\s+([-0-9]+)\\).*';

// \s*ALERT:\s*You\'ve\s+spent\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+[CcRrEeDdiITt]+\s+[CaCArRdD]+\s+([xX0-9]+)\s+at\s+([a-zA-Z0-9.-@\s]+)\s+on\s+(\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}).[NOTnot]+\s+you\?\s*Call\s+\d+.\s*

const p = new RegExp(pattern.replace("(?s)",''), 'gim');
console.log(p);
var matcher = p.exec(message.sender_message);
console.log(matcher);