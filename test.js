
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
  "sender_message": "UPDATE: Your A/c XX1800 credited with INR 1,350.00 on 04-10-19 by A/c linked to mobile no XX2753 (IMPS Ref No. 927719482073) Available bal: INR 4,108.99"
}

// message = {
//   "customer_id": 325170533,
//   "sender": "BZ-SBIINB",
//   "sender_timestamp": "2017-01-02 14:26:09",
//   "sender_message": "Your a/c no. XXXXXXXX0791 is credited by Rs.10.00 on 21-12-16 by a/c linked to mobile 8XXXXXX000 (IMPS Ref no 635621846659)."
// }
printMatchedPattern(message);

var start = new Date().getTime();
console.log(start);


// ==================Template for Debit Transaction with Credit Card===========
// regexObj = {
//   pattern: "(?s)\\s*(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+was\\s+spent\\s+on\\s+your\\s+[CREDITcredit]*\\s+[CARDcard]*\\s+([xX0-9]+)\\s+on\\s+(\\d{2}-\\w{3,4}-\\d{2})\\s+at\\s+([a-zA-Z0-9.,-@\\s]+)\\.\\s+[AvblaBVL]+\\s+[LMTlmt]+\\:(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).\\s+Call\\s+\\d+.*\\s?",
//   posOutstanding: -1,
//   dateModified: start,  
//   runawayCount: 2,
//   posAvailableLimit: 5,
//   posMerchant: 4,
//   merchantName: "",
//   bankName: "AXIS",
//   posAmount: 1,
//   posDate: 3,
//   posMerchantAcountId: 2,
//   paymentType: "credit-card",
//   msgType: "debit-transaction",
//   txnType: "regular",
//   accountType: "credit-card",
//   address: "AXISBK",
//   msgSubType: "expense",
//   dateCreated: start,
//   posAccountId: 2,

// }


// ===================Template for Debit Transaction on Debit Card================
regexObj = {
  dateModified: start,  
  runawayCount: 1,
  merchantName: "",
  posTxnNote: -1,
  bankName: "HDFC",
  alternateDateFormat: "",
  pattern: "(?s)UPDATE\\:\\s+[yY]our\\s+a\\/c\\s+([xX0-9]+)\\s+credited\\s+with\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+(\\d{2}\\-\\d{2}\\-\\d{2})\\s+by\\s+a\\/c\\s+linked\\s+to\\s+mobile\\s+no\\s+[\\d\\w\\s\\(\\).]+\\s*Available\\s+bal:\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)",
  posAmount: 2,
  posMerchant: -1,
  paymentType: "debit-card",
  splitPattern: "",
  msgType: "debit-transaction",
  txnType: "regular",
  accountType: "debit-card",
  address: "HDFCBK",
  posAvailableLimit: 4,
  msgSubType: "expense",
  dateCreated: start,
  posDate: 3,
  posMerchantAcountId: 1,
  posAccountId: 1,
}


var addNewRegex = function (regexObj) {
  return new Promise(async (resolve, reject) => {
    try {

      let client = await MongoClient.connect((process.env.MONGO_URL || "mongodb://localhost:27017/"));
      var db = client.db("qykly_dev");

      let templates = await db.collection('regexes').insertOne(regexObj);
      client.close();
    }
    catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
// addNewRegex(regexObj);


// Regexes Added

// pattern = '(?s)\\s*Your\\s+a/c\\s+no\\.\\s+([xX0-9]+)\\s+is\\s+credited\\s+by\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+(\\d{2}-\\d{2}-\\d{2})\\s+by\\s+a/c\\s+linked\\s+to\\s+mobile\\s+([xX0-9]+)\\s+\\(IMPS\\s+Ref\\s+no\\s+([-0-9]+)\\).*';
// pattern = "(?s)\\s*ALERT:\\s*You\\'ve\\s+spent\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+[CcRrEeDdiITt]+\\s+[CaCArRdD]+\\s+([xX0-9]+)\\s+at\\s+([a-zA-Z0-9.-@\\s]+)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2}:\\d{2}:\\d{2}:\\d{2}).[NOTnot]+\\s+you\\?\\s*Call\\s+\\d+.\\s*"
// pattern = "(?s)\\s*(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+was\\s+spent\\s+on\\s+your\\s+[CREDITcredit]*\\s+[CARDcard]*\\s+([xX0-9]+)\\s+on\\s+(\\d{2}-\\w{3,4}-\\d{2})\\s+at\\s+([a-zA-Z0-9.,-@\\s]+)\\.\\s+[AvblaBVL]+\\s+[LMTlmt]+\\:(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).\\s+Call\\s+\\d+.*\\s?"
// pattern = "\\s*UPDATE:\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+deposited\\s+in\\s+a\\/c\\s+([xX\\d]+)\\s+on\\s+(\\d{2}-\\w{3,4}-\\d{2})\\s+[\\w\\d\\-\\s@]+.\\s*Avl\\s+bal:(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)"
// pattern = "\\s*UPDATE:\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+debited\\s+from\\s+a\\/c\\s+([xX\\d]+)\\s+on\\s+(\\d{2}-\\w{3,4}-\\d{2}).\\s+Info:\\s+[\\w\\d\\-\\s]+.\\s+Avl\\s+bal:(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)"
// pattern = "(?s)ALERT:You\\'ve\\s+spent\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+via\\s+Debit\\s+card\\s+([xX0-9]+)\\s+at\\s+([\\w\\s-\\\\\\.,]+)\\s+on\\s+(\\d{4}-\\d{2}-\\d{2}:\\d{2}:\\d{2}:\\d{2}).Avl\\s+Bal\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).[\\w\\d?\\s]*."

// Have to add reg objects

// pattern = "(?s)\\s*Thanks\\s+for\\s+using\\s+HDFC\\s+Bank\\s+Visa\\s+FoodPlus\\s+Card\\s+Card\\s+([xX0-9]+)\\s+for\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+at\\s+([a-zA-Z0-9.,-@\\s]+)\\s?on\\s+(\\d{2}-\\w{3,4}-\\d{2}\\s+\\d{2}:\\d{2}\\s+[AMamPMpm]*)\\.\\s+Card\\s+Bal:\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\.\\s+Not\\s+[Yy]ou\\s+\\?\\s+Call\\s+\\d+.*\\s?"
// Message: Thanks for using HDFC Bank Visa FoodPlus Card Card XXXX2164 for INR 350.28 at FUTURE RETAIL LTD on 02-OCT-19 09:10 PM. Card Bal: INR 5554.77. Not You ? Call 912261606161.

// pattern = "\s*(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+debited\s+from\s+a\/c\s+([\*\d]+)\s+on\s+(\d{2}-\d{2}-\d{2})\s+to\s+VPA\s+([\w\.\-\@\d]+)\(UPI\s+Ref\s+No\s+([0-9]+)\).\s+[Nn]ot\s+[Yy]ou\?\s+Call\s+on\s+\d+\s+to\s+report\s*"
// Message: Rs 3000.00 debited from a/c **1800 on 25-10-19 to VPA 9787082753@ybl(UPI Ref No 929836119125). Not you? Call on 18002586161 to report

// pattern = "\s*(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+credited\s+to\s+a\/c\s+([xX\d]+)\s+on\s+(\d{2}-\d{2}-\d{2})\s+by\s+a\/c\s+linked\s+to\s+VPA\s+([\w\-@\.]*)\s+\(UPI\s+[Rr]ef\s+[Nn]o\s+([0-9]+)\).\s*"
// message: Rs. 26.00 credited to a/c XXXXXX1800 on 07-10-19 by a/c linked to VPA goog-payment@okaxis (UPI Ref No  928004979163).

// pattern = "\s*[Yy]our\s+[Aa]\/c\s+([\d]+)\s+is\s+debited\s+with\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+(\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2})\s+at\s+([\w\/.*@\-\s]*)\.[Aa]vbl\s+[Bb]al\s+is\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\.[Cc]all\s+\d*\s+for\s+dispute\s*"
// message: Your A/c 384674 is debited with Rs 900.00 on 06-10-2019 19:42:55 at PUR/MSW*HOTEL KOHINOOR/Bardhaman.Avbl Bal is Rs 63639.15.Call 18605005555 for dispute

// pattern = "\s*[Yy]our\s+[Aa]\/c\s+([\d]+)\s+is\s+debited\s+with\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+(\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2})\s+[Aa]\/c\s+[Bb]al\:(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)[\w\s\d\-\:\/\.]*"
// message: Your A/c 384674 is debited with Rs 4000.00 on 06-10-2019 20:03:22 A/c Bal:Rs 59639.15 Info: CASH-ATM/13124001.Call 18605005555 if txn not done by you.

//pattern = "\s*[Yy]our\s+[Aa]\/c\s+([\d]+)\s+is\s+debited\s+by\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+(\d{2}\w{3,4}\d{2})\.\s+[Aa]vbl\s+[Bb]al\:\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\.[\w\s\d\-\:\/\.]*"
// message = Your A/c 384674 is debited by Rs. 76 on 04Oct19. Avbl Bal: Rs. 43803.15. Info: UPI/P2M/927739568952/BharatpeM/ICICI Ban. Call 18605005555 for dispute


// pattern = "\s*[Yy]our\s+[Aa]\/c\s+([\d]+)\s+is\s+credited\s+with\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+(\d{2}\w{3,4}\d{2})\.\s+[Aa]vbl\s+[Bb]al\:\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\.[\w\s\d\-\:\/\.]*"
// message Your A/c 384674 is credited with Rs. 64362 on 10Oct19. Avbl Bal: Rs. 116950.15. Info: INB-BULK-UPLD/772253938599/SALARY/SEP/20

// pattern = "\s*[Yy]our\s+[Aa]\/c\s+([xX0-9]+)\s+has\s+a\s+debit\s+by\s+transfer\s+of\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+on\s+(\d{2}\/\d{2}\/\d{2}).\s+[Aa]vl\s+[Bb]al\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\.\s*"
// message: Your A/C XXXXX326495 has a debit by transfer of Rs 500.00 on 03/10/19. Avl Bal Rs 3,419.77.

pattern = "(?s)UPDATE\\:\\s+[yY]our\\s+a\\/c\\s+([xX0-9]+)\\s+credited\\s+with\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+on\\s+(\\d{2}\\-\\d{2}\\-\\d{2})\\s+by\\s+a\\/c\\s+linked\\s+to\\s+mobile\\s+no\\s+[\\d\\w\\s\\(\\).]+\\s*Available\\s+bal:\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)"
// message: UPDATE: Your A/c XX1800 credited with INR 1,350.00 on 04-10-19 by A/c linked to mobile no XX2753 (IMPS Ref No. 927719482073) Available bal: INR 4,108.99






//pattern = "ALERT:(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+spent\s+via\s+credit\s+card\s+([xX0-9]+)\s+at\s+([\w\s-\\\.,]+)\s+on\s+(\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}).[\w\d?\s\/.]*"
// message: ALERT:Rs.5633.31 spent via CREDIT Card xx7498 at AMAZON1258399 on 2019-10-05:18:09:15 without PIN/OTP.Not you?Call 18002586161.

// pattern = "Dear\s+investor,this\s+is\s+to\s+inform\s+you\s+that\s+your\s+SIP\s+installment\s+amount\s+for\s+(?:Rs\.?|INR)(?:\s*)([0-9,]+(?:\.[0-9]+)?|\.[0-9]+)\s+in\s+([\w\s\-\,\.\d\/]+)\s+is\s+due\s+on\s+(\d{2}\/\d{2}\/\d{4})."
// message: Dear Investor,This is to inform you that your SIP installment amount for Rs. 7500.00 in Motilal Oswal Multicap 35 Fund - Regular Plan - Growth is due on 15/10/2019. - FundzBazar Team









// const p = new RegExp(pattern.replace("(?s)",''), 'gim');
// console.log(p);
// var matcher = p.exec(message.sender_message);
// console.log(matcher);