
// const MongoClient = require('mongodb').MongoClient;
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
for(var i = 0; i<json.length; i++){
  if(!(json[i].msgType in uniqueMsgType)){
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
console.log(json)