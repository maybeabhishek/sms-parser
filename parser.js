var Parser = {};
//var java = require('java');
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    assert = require('assert'),
    async = require('async'),
    fs = require('fs'),
    uuid = require('uuid'),
    moment = require('moment'),
    _ = require('underscore'),
    UserTransaction = require('./user-transaction').UserTransaction,
    PurchasesTable = require('./purchase').PurchasesTable,
    DateUtil = require('./dateUtil');

// var cluster = require('cluster');

// Number of threads we're going to create
var numThreads = require('os').cpus().length;
console.log("numThreads ", numThreads);
// var javaLangSystem = java.import('java.util.regex.Pattern');

//var Pattern = java.import("java.util.regex.Pattern");

var TravelTable = function() {
    return {
        "_id": ObjectID(),
        "bookingType": "",
        "chartPrepared": false,
        "dateModified": Date.now(),
        "isError": false,
        "isReturnTicket": false,
        "merchantCode": "",
        "merchantName": "",
        "msgId": "",
        "platformNumber": 0,
        "posClass": "",
        "posDestination": "",
        "posPNR": "",
        "posSeatNo": "",
        "posSource": "",
        "posStatus": "",
        "posTime": "",
        "posTotalBalance": 0,
        "posTrainId": "",
        "senderName": "",
        "startDate": "",
        "totalPassengers": "",
        "update": 0,
        "userId": "",
        "uuid": "",
        "category": "travel",
        "regexId": "",
        "authToken": "",
        "saveTime": Date.now()
    }
}

var UserBill = function() {
    return {
        "_id": ObjectID(),
        "billDate": new Date(),
        "billName": "",
        "dateCreated": new Date(),
        "dateModified": new Date(),
        "hideNotification": false,
        "minAmount": 0,
        "msgId": "",
        "offTransactionId": 0,
        "onTransactionId": 0,
        "paidOn": null,
        "status": 0,
        "synced": false,
        "systemGenerated": false,
        "totalAmount": 0,
        "userBillerId": "",
        "userId": "",
        "uuid": "",
        "regexId": "",
        "category": "user_bills",
        "saveTime": new Date(),
        "date": new Date()
    }
}

// javaLangSystem.out.printlnSync('Hello World');
// var p = Pattern.compileSync("\\s*Your\\s+ebill\\s+password\\(lower case\\)\\s+is.*");

// var matcher = p.matcherSync('Your ebill password(lower case) is mzq4. For security reasons we advise you not to disclose your password. Add ebill@airtel.com to your email contacts to avoid mail going to spam. For easy understanding of bill, click www.airtel.in/billdemo');
// var pattern = Pattern.compileSync("(?s)\\s*Thank\\s+You\\s+for\\s+using\\s+your\\s+HDFC\\s+Bank\\s+Visa\\s+(?:MoneyPlus|FoodPlus|MoneyPlus\\s*Petty)\\s*(?:Card)?\\s+Card\\s+ending\\s+with\\s+(.*)\\s+for\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+)\\s+at\\s+([A-Z0-9\\W]+)\\s+on\\s+(.*).\\s+Post\\s+txn\\s+Card\\s+Bal\\s+is\\s+(?:Rs\\.?|INR)(?:\\s*)([0-9,]+(?:\\.[0-9]+)?|\\.[0-9]+).");
// var matcher = pattern.matcherSync("Thank You for using your HDFC Bank Visa FoodPlus Card Card ending with XXXX8302 for INR 20 at OM SRI KANYAKA CATERIN on 21-DEC-16 08:12 AM. Post txn Card Bal is INR 968.24.");

// console.log(matcher.groupCountSync());
// if (matcher.findSync()) {
//  console.log("find")
//  for (var i = 0; i < matcher.groupCountSync(); i++) {
//      console.log(matcher.groupSync(i));
//  }
// }

var startTime = new Date().getTime();
var Billers = [];
MongoClient.connect((process.env.MONGO_URL || "mongodb://localhost:27017/"), function(err, client) {
    var db = client.db("qykly_dev")
    assert.equal(null, err);
    assert.ok(db != null);
    console.log("started");

    db.collection('regexes').find({}).toArray(function(err, templates) {
        console.log(err);
        if (!err) {
            db.collection('billers').find({}).toArray(function(err, billers) {
                if (!err) {
                    Billers = billers;
                    console.log("billers ", Billers.length);
                    db.collection('blacklisteds').find({}).toArray(function(err, blacklisteds) {
                        if (!err) {
                            console.log(blacklisteds.length);
                            var blackLists = _.indexBy(blacklisteds, "Sender");

                            // if (cluster.isMaster) {
                            //     // Starting time
                            //     var start = Date.now();
                            //     var dirs = [];
                            //     fs.readdirSync('JSON_Files').forEach(function(dir) {
                            //         if (fs.lstatSync('JSON_Files/' + dir).isDirectory() && dir != "test") {
                            //             dirs.push('JSON_Files/' + dir);
                            //             // fs.readdirSync('JSON_Files/' + dir).forEach(function(file) {
                            //             //     if (~file.indexOf('.json')) {
                            //             //         var smsList = JSON.parse(fs.readFileSync('JSON_Files/' + dir + '/' + file, 'utf8'));
                            //             //         //console.log("total", smsList.length);
                            //             //         processSms(smsList.filter(function(sms) {
                            //             //             return !blackLists[(sms.sender + "").split('-').pop().toUpperCase()];
                            //             //         }), db, _.groupBy(templates, function(temp) {
                            //             //             return temp.address;
                            //             //         }), 0)
                            //             //     }
                            //             // });
                            //         }
                            //     });
                            //     // Sending them the arrays they should sort;
                            //     for (var t = 0; t < numThreads; t++) {
                            //         var worker = cluster.fork();

                            //         // When the workers send a message with the results we save them
                            //         // After we've got the results we kill the worker
                            //         worker.on('message', function() {
                            //             console.log('Process ' + this.process.pid + '  has finished sorting its arrays.');
                            //             this.destroy();
                            //         });

                            //         // Here we're sending some random arrays for the worker to sort
                            //         worker.send(dirs[t]);



                            //     }

                            //     cluster.on('exit', function(worker) {
                            //         // When the master has no more workers alive it
                            //         // prints the elapsed time and then kills itself 
                            //         if (Object.keys(cluster.workers).length === 0) {
                            //             console.log('Every worker has finished its job.');
                            //             console.log('Elapsed Time: ' + (Date.now() - start) + 'ms');
                            //             process.exit(1);
                            //         }
                            //     });

                            // } else {
                            //     // This is the work our workers are going to do
                            //     // They start working after getting the message with some random arrays
                            //     process.on('message', function(path) {
                            //         fs.readdirSync(path).forEach(function(file) {
                            //             if (~file.indexOf('.json')) {
                            //                 var smsList = JSON.parse(fs.readFileSync('JSON_Files/' + dir + '/' + file, 'utf8'));
                            //                 //console.log("total", smsList.length);
                            //                 processSms(smsList.filter(function(sms) {
                            //                     return !blackLists[(sms.sender + "").split('-').pop().toUpperCase()];
                            //                 }), db, _.groupBy(templates, function(temp) {
                            //                     return temp.address;
                            //                 }), 0);
                            //             }
                            //         });

                            //         process.send('compelete');
                            //     });
                            // }

                            // fs.readdirSync('JSON_Files').forEach(function(file) {
                            //     if (~file.indexOf('.json')) {
                            //         console.log(file);
                            //         var smsList = JSON.parse(fs.readFileSync('JSON_Files/test/' + file, 'utf8'));
                            //         console.log(smsList.length);

                            //         // var smsList = [{
                            //         //  "customer_id": 228923467,
                            //         //  "sender": "AD-HDFCBK",
                            //         //  "sender_timestamp": "2017-01-02 19:16:48",
                            //         //  "sender_message": "Dear Customer, this is to inform you that your monthly instalment of Rs. INR 5,000.00 of RD XXXXX8298 is due on 02-JAN-17."
                            //         // }]
                            //         processSms(smsList.filter(function(sms) {
                            //             return blacklisteds.indexOf(sms.sender) < 0;
                            //         }), db, _.groupBy(templates, function(temp) {
                            //             return temp.address;
                            //         }), 0)
                            //     }
                            // });
                            var start = Date.now();
                            var dirs = [];

                            // ====================================       OG           ==========================================
                            // fs.readdirSync('JSON_Files').forEach(function(dir) {
                            //     if (fs.lstatSync('JSON_Files/' + dir).isDirectory() && dir != "test") {
                            //         dirs.push('JSON_Files/' + dir);
                            //         fs.readdirSync('JSON_Files/' + dir).forEach(function(file) {
                            //             if (~file.indexOf('.json')) {
                            //                 var smsList = JSON.parse(fs.readFileSync('JSON_Files/' + dir + '/' + file, 'utf8'));
                            //                 //console.log("total", smsList.length);
                            //                 processSms(smsList.filter(function(sms) {
                            //                     return !blackLists[(sms.sender + "").split('-').pop().toUpperCase()];
                            //                 }), db, _.groupBy(templates, function(temp) {
                            //                     return temp.address;
                            //                 }), 0)
                            //             }
                            //         });
                            //     }
                            // });
                            // ===================================================================================================

                            /*fs.readdirSync('JSON_Files/test').forEach(function(file) {
                                if (~file.indexOf('.json')) {
                                    console.log(file);
                                    var smsList = JSON.parse(fs.readFileSync('JSON_Files/test/' + file, 'utf8'));
                                    console.log("Sms : " + smsList.length);
                                    processSms(smsList.filter(function(sms) {
                                        return !blackLists[(sms.sender + "").split('-').pop().toUpperCase()];
                                    }), db, _.groupBy(templates, function(temp) {
                                        return temp.address;
                                    }), 0)
                                }
                            });*/
                        }
                    });
                }
            });
        }
    });

});

function isNull(arg) {
    return !arg || arg == '';
}

function getBiller(userTransaction, sms) {
    var userBill = new UserBill();
    userBill.uuid = uuid.v4();
    if (!isNull(userTransaction.merchantAccountId)) {
        userBill.billAccountId = getAccountId(userTransaction.merchantAccountId);
        // userBill.setBillAccountId(Utility.getAccountId(merchantAccountId));
    } else if (!isNull(userTransaction.billId)) {
        userBill.billAccountId = getAccountId(userTransaction.merchantAccountId);
    } else {
        console.log("BILLDATA_NULL", "ACCOUNT ID IS NULL");

    }

    if (!isNull(userTransaction.billDate)) {
        // userBill.setBillDate(billDate);
        userBill.billDate = userTransaction.billDate;
    } else if (!isNull(userTransaction.date)) {
        // userBill.setBillDate(date);
        userBill.billDate = userTransaction.date;
    } else {
        userBill.billDate = userTransaction.dateCreated;
        // userBill.setBillDate(dateCreated);
    }

    if (!isNull(userTransaction.merchantName)) {
        // userBill .setBillName(merchantName);
        userBill.billName = userTransaction.merchantName;
    } else if (!isNull(userTransaction.bankName)) {
        // userBill.setBillName(bankName);
        userBill.billName = userTransaction.bankName;
    }

    if (!isNull(userTransaction.dueDate)) {
        // userBill.setDueDate(Utility.getTravelDate(sms.getSmsTime(), dueDate));
        console.log("userTransaction due date", userTransaction.dueDate)
        userBill.dueDate = getTravelDate(sms.sender_timestamp, moment(userTransaction.dueDate)).toDate();
    }


    var mName = isNull(userTransaction.merchantName) ? userTransaction.bankName : userTransaction.merchantName;
    if (!isNull(mName)) {

        _.every(Billers, function(biller) {
            if (biller.name.includes(mName) || biller.aliases.includes(mName)) {
                userBill.userBillerId = biller.id;
                userBill.billName = biller.name;
                return false;
            }
            return true
        });
        // for (Biller biller: billers) {
        //  if (biller.getName().contains(mName) || biller.getAliases().contains(mName)) {
        //      userBill.setUserBillerId(biller.id);
        //      userBill.setBillName(biller.getName());
        //      break;
        //  }
        // }
    }

    userBill.totalAmount = userTransaction.totAmountDue;
    userBill.minAmount = userTransaction.minAmountDue;
    userBill.msgId = (userTransaction.smsId);
    userBill.userId = sms.customer_id;
    userBill.status = 1;
    userBill.regexId = userTransaction.regexId;

    // if (!isNull(userTransaction.paidOn)) {
    //  userBill.paidOn(userTransaction.paidOn);
    // } else if (!isNull(UserTransaction.date)) {
    //  userBill.setPaidOn(date);
    // } else if (!Utility.isNull(dateCreated)) {
    //  userBill.setPaidOn(dateCreated);
    // }

    // if (MsgTemplate.COL_BILL_PAYMENT_CONFIRMATION.equalsIgnoreCase(msgSubType) || MsgTemplate.COL_BILL_PAYMENT_INITIATION.equalsIgnoreCase(msgSubType) || MsgTemplate.TRANSFER_IN.equalsIgnoreCase(msgSubType)) {
    //  userBill.setStatus(UserBill.STATUS_PAID);
    // }

    return userBill;
}


var count = 1;
var purchaseData = [];
var totalTime = 0;
var transactionCount = 1;
var processSms = function(smsList, qyklyDb, templates, index) {
    if (index == smsList.length) {
        var end = new Date().getTime();
        var time = end - startTime;
        totalTime += time;
        console.log("time taken ", time);   //19143504
        console.log("total time ", totalTime);    //5822855458
        return
    }


    var message = smsList[index];
    message.id = uuid.v4();
    var unparsedSmsData = [];
    var obj = {
        table: []
    };
    qyklyDb.collection('sms').insert(message, function(err) {
        // console.log(Object.keys(templates))
        var msgTemplates = templates[(message.sender + "").split('-').pop().toUpperCase()] || [];

        var start = new Date().getTime();

        for (var i = 0; i < msgTemplates.length; i++) {
            try {
                var msgTemplate = msgTemplates[i];
                const pattern = new RegExp(msgTemplate.pattern.replace('(?s)', ''), 'gim');
                // Pattern.compile(stringPattern, Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.UNIX_LINES);
                // var pattern = Pattern.compileSync(msgTemplate.pattern);
                var matcher = pattern.exec(message.sender_message);

                if (matcher != null) {
                    if (msgTemplate.splittable && "bank".toUpperCase() == msgTemplate.accountType.toUpperCase() && "balance-notification".toUpperCase() == (msgTemplate.msgSubType.toUpperCase())) {
                        console.log(msgTemplate.splittable, " transaction splitable", transactionCount++)
                        const re1 = new RegExp((msgTemplate.split_pattern || "").replace('(?s)', ''));
                        var matcher1 = re1.exec(message.sender_message);

                        if (matcher1 != null) {
                            try {
                                var userTransaction = getUserTransaction(msgTemplate, matcher, message);
                                var end = new Date().getTime();
                                var time = end - start;
                                userTransaction.parsingTime = time;
                                qyklyDb.collection('ProcessedData-user-transactions').insert(userTransaction);
                            } catch (e) {
                                qyklyDb.collection('unparsedSmsWithError').insert(message);
                            }
                        }
                    } else {
                        switch (msgTemplate.msgType) {
                            case "purchase":
                                console.log("Purchase");
                                try {
                                    var purchase = insertPurchaseDataToDb(msgTemplate, matcher, (message.time || message.sender_timestamp), msgTemplate.posAmount,
                                        msgTemplate.posOrderId, msgTemplate.posAwbNumber,
                                        msgTemplate.posCourierName, msgTemplate.posDeliveryDate,
                                        msgTemplate.posProductName, msgTemplate.posExpectedDate, message.sender_message, message.customer_id);
                                    var end = new Date().getTime();
                                    var time = end - start;
                                    purchase.parsingTime = time;
                                    qyklyDb.collection('ProcessedData-purchases').insert(purchase);
                                    purchaseData.push(purchase);
                                } catch (e) {
                                    console.log(e.stack);
                                    // msgTemplate.setDeprecated(true);
                                    // logTemplateError(parsedSms, msgTemplate, e);
                                    // updatedTemplates.add(msgTemplate);
                                    // parsedSms.setProcessStatus(SMSData.UNPROCESSED);
                                    // processedSmsList.add(parsedSms);
                                    qyklyDb.collection('unparsedSmsWithError').insert(message);
                                    continue;
                                }
                                break;
                            case "travel":
                                console.log("new travel");
                                if (msgTemplate.msgSubType == "new_book") {
                                    try {
                                        var travelTable = getTravelTable(msgTemplate, matcher, message);
                                        if (travelTable != null) {
                                            qyklyDb.collection('ProcessedData-travel').insert(travelTable);
                                        }
                                    } catch (e) {
                                        // msgTemplate.setDeprecated(true);
                                        // logTemplateError(parsedSms, msgTemplate, e);
                                        // updatedTemplates.add(msgTemplate);
                                        // parsedSms.setProcessStatus(SMSData.UNPROCESSED);
                                        // processedSmsList.add(parsedSms);
                                        qyklyDb.collection('unparsedSmsWithError').insert(message);
                                        continue;
                                    }
                                }
                                //  else if (msgTemplate.msgSubType == "travel_notification") {
                                //  try {
                                //      var travelTable = updateTravelData(msgTemplate, matcher, message);
                                //      if (travelTable != null) {
                                //          qyklyDb.collection('ProcessedData-travel').insert(travelTable);
                                //      }
                                //  } catch (e) {
                                //      console.log(e.stack);
                                //      // msgTemplate.setDeprecated(true);
                                //      // logTemplateError(parsedSms, msgTemplate, e);
                                //      // updatedTemplates.add(msgTemplate);
                                //      // parsedSms.setProcessStatus(SMSData.UNPROCESSED);
                                //      // processedSmsList.add(parsedSms);
                                //      qyklyDb.collection('unparsedSmsWithError').insert(message);
                                //      continue;
                                //  }
                                // }
                                break;
                            case "bill":
                            case "service-notification":
                                console.log('transaction msg ', transactionCount++)
                                try {
                                    var transaction = getUserTransaction(msgTemplate, matcher, message);
                                    var end = new Date().getTime();
                                    var time = end - start;
                                    transaction.parsingTime = time;
                                    if (transaction.msgSubType) {
                                        var msgSubType = transaction.msgSubType;
                                        if (transaction.msgSubType == "new-bill" || transaction.msgSubType == "cc-estatement" || transaction.msgSubType == "cc-statement" || msgSubType == "emi-notification" || msgSubType == "emi-installment" || msgSubType == "bill-reminder" ||
                                            msgSubType == "bill reminder") {
                                            // var userBill = {};
                                            try {
                                                var userBill = getBiller(transaction, message);
                                                if (userBill != null && userBill.billAccountId && userBill.dueDate) {
                                                    // userBillList.add(userBill);

                                                    // Log.d("BILLDATA", userBill.getBillName() + " : " + userBill.getBillAccountId());
                                                    // console.log("biller ");
                                                    qyklyDb.collection('ProcessedData-user_bills').find({
                                                        billAccountId: userBill.billAccountId,
                                                        userId: userBill.userId,
                                                        totalAmount: userBill.totalAmount,
                                                        dueDate: userBill.dueDate
                                                    }).toArray(function(err, exists) {
                                                        if (!err && !exists[0]) {
                                                            qyklyDb.collection('ProcessedData-user_bills').insert(userBill);
                                                        }
                                                    });
                                                }
                                            } catch (e) {
                                                console.log(e.stack);
                                                qyklyDb.collection('unparsedSmsWithError').insert(message);
                                            }

                                        } else if (!msgTemplate.splittable && transaction.msgSubType == ("balance-notification")) {
                                            qyklyDb.collection('ProcessedData-user-transactions').insert(transaction);

                                        }
                                    }

                                } catch (e) {
                                    // console.log(e.stack);
                                    // msgTemplate.setDeprecated(true);
                                    // logTemplateError(parsedSms, msgTemplate, e);
                                    // updatedTemplates.add(msgTemplate);
                                    // parsedSms.setProcessStatus(SMSData.UNPROCESSED);
                                    // processedSmsList.add(parsedSms);

                                    qyklyDb.collection('unparsedSmsWithError').insert(message);

                                }
                                break;
                            default:
                                try {
                                    var userTransaction = getUserTransaction(msgTemplate, matcher, message);
                                    var end = new Date().getTime();
                                    var time = end - start;
                                    userTransaction.parsingTime = time;
                                    qyklyDb.collection('ProcessedData-user-transactions').insert(userTransaction);


                                } catch (e) {
                                    qyklyDb.collection('unparsedSmsWithError').insert(message);
                                }
                                break;
                        }
                    }
                    message.isProcessed = 1;
                    qyklyDb.collection('parsedSms').insert(message);
                    break;
                }
            } catch (e) {
                console.log(e.stack);
                // console.log(msgTemplates[i]);
                console.log(message.sender_message);
                continue;
            }

        }
        if (message.isProcessed != 1) {
            console.log('unparsedSmsData');
            qyklyDb.collection('unparsedSmsData').insert(message);
        }

        /*if (unparsedSmsData.length > 0) {
            var col = qyklyDb.collection('unparsedSmsData');
            try {
                col.insertMany(unparsedSmsData, function(error, result) {
                    if (error) {
                        console.log('Error is on insert');
                    } else {
                        console.log("Successfully Inserted");
                        unparsedSmsData.length = 0;
                    }
                });
            } catch (e) {
                console.log('Error while insertion');
            }
        }*/
        processSms(smsList, qyklyDb, templates, ++index);
    });
};


var getAccountId = function(accountId) {
    console.log("before format ", accountId);
    accountId = accountId.trim();
    accountId = accountId.toLowerCase();

    var length = accountId.length;
    if (accountId.length >= 10 && !accountId.indexOf("x") >= 0 && /^\d+$/.test(accountId) && !accountId.indexOf("*") >= 0 && !accountId.indexOf("N") >= 0) {
        return accountId;
    }

    accountId = accountId.replace(new RegExp('x', 'g'), "").replace(new RegExp('/*', 'g'), "").replace(new RegExp('N', 'g'), "").replace(new RegExp("/", 'g'), "");
    if (length > 0) {
        var formatted = "";
        var subMarker = 0;
        length = accountId.length;
        if (length < 4) {
            subMarker = 0;
        } else {
            subMarker = length - 4;
        }
        try {
            accountId = accountId.substring(subMarker);
        } catch (e) {
            console.log(e.stack);
        }
        // try {
        //  formatted = String.format("%04d", Integer.parseInt(accountId));
        // } catch (e) {

        //  formatted = accountId;
        // }
        formatted = accountId;
        accountId = "xxxx" + formatted;
        console.log("after format ", accountId);
    }

    return accountId;
}
var getParsedDate = function(dateString, dateFormat, alternateDateFormat, formats) {
    dateFormat = dateFormat.toUpperCase().replace(":MM", ":mm").replace("AA", "aa");
    alternateDateFormat = alternateDateFormat ? alternateDateFormat.toUpperCase().replace(":MM", ":mm").replace("AA", "aa").replace('TH', "S") : alternateDateFormat;

    console.log("getParsedDate transaction ", dateString, dateFormat, alternateDateFormat, formats);
    var date = null;
    if (formats) {
        try {
            date = moment(dateString, dateFormat)
        } catch (e) {
            try {
                date = moment(dateString, alternateDateFormat);
            } catch (e) {
                formats = Object.values(DateUtil.dateFormats)
                for (i = 0; i < formats.length; i++) {
                    try {
                        formats[i] = formats[i].toUpperCase().replace(":MM", ":mm").replace("AA", "aa").replace('TH', "S");
                        date = moment(dateString, formats[i])
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
    } else {
        try {
            date = moment(dateString, dateFormat)
        } catch (e) {
            date = moment(dateString, alternateDateFormat);
        }
    }
    return date;

}


var getUserTransaction = function(msgTemplate, matcher, parsedSms, start) {
    var userTransaction = new UserTransaction();
    userTransaction.uuid = uuid.v4();
    userTransaction.msgType = msgTemplate.msgType;
    userTransaction.msgSubType = msgTemplate.msgSubType;
    userTransaction.regexId = msgTemplate._id.toString();
    var posBankName = msgTemplate.posBankName;
    if (posBankName > -1) {
        var BankName = (matcher[posBankName] || '').trim();
        userTransaction.bank_name = BankName;
    }

    var posAccountType = msgTemplate.accountType;
    if (posAccountType > -1) {
        var AccountType = matcher[posAccountType];
        userTransaction.account_type = AccountType;
    }

    var posAccountId = msgTemplate.posAccountId;
    if (posAccountId > -1) {
        var AccountId = (matcher[posAccountId] || '').trim();

        var length = AccountId.length;
        if (length > 0) {
            AccountId = getAccountId(AccountId);
        }

        userTransaction.accountNumber = AccountId;
    } else if (msgTemplate.accountType == "wallet") {
        userTransaction.accountNumber = msgTemplate.merchantName + "WALLET";
    }

    var posAmount = msgTemplate.posAmount;
    if (posAmount > -1) {
        var multiplier = 1;
        // if (msgTemplate.pos_crn > -1) {
        //  multiplier = currency.getRates().getCurrency(msgTemplate.getPosCRN());
        // }
        var Amount = matcher[posAmount] || "";
        var amount = parseFloat(Amount.replace(",", "")) * multiplier;
        userTransaction.amount = amount;
    }

    var posAmountPaid = msgTemplate.posAmountPaid;
    if (posAmountPaid > -1) {
        var AmountPaid = matcher[posAmountPaid] + "";
        var amount = parseFloat(AmountPaid.replace(",", "")) || 0;
        userTransaction.amountPaid = amount;
    }

    var posAvailableLimit = msgTemplate.posAvailableLimit;
    if (posAvailableLimit > -1) {
        var AvailableLimit = matcher[posAvailableLimit] || "";
        var availableLimit = parseFloat(AvailableLimit.replace(",", "")) || 0;
        userTransaction.availableLimit = AvailableLimit;
    }

    var posBalance = msgTemplate.posBalance;
    if (posBalance > -1) {
        //Todo 
        var balanceString = (matcher[posBalance] || "").replace(",", "");
        if (balanceString.length > 0 && balanceString.charAt(balanceString.length - 1) == '.') {
            balanceString = balanceString.substring(0, balanceString.length - 1);
        }
        var balance = parseFloat(balanceString) || 0;
        userTransaction.balance = Math.abs(balance);

    } else {
        // if (userTransaction.account_id != "" && userTransaction.amount > 0) {
        //  var balance = Prefs.getFloatInPreference(context, userTransaction.getAccountNumber());
        //  double amount = userTransaction.getAmount();
        //  if (balance > 0) {
        //      if (userTransaction.getMsgType().equalsIgnoreCase(MsgTemplate.DEBIT_TRANSACTION)) {
        //          balance = balance - amount;
        //      } else if (userTransaction.getMsgType().equalsIgnoreCase(MsgTemplate.CREDIT_TRANSACTION)) {
        //          balance = balance + amount;
        //      }
        //      userTransaction.setBalance(balance);
        //  }
        // }
    }

    var posBillDate = msgTemplate.posBillDate;
    if (posBillDate > -1) {
        var BillDate = matcher[posBillDate];
        userTransaction.billDate = getParsedDate(BillDate, msgTemplate.dateFormat, msgTemplate.alternateDateFormat).toDate();
    }

    var posBillId = msgTemplate.posBillId;
    if (posBillId > -1) {
        var BillId = matcher[posBillId];
        userTransaction.billId = BillId;
    }

    var posBillPeriod = msgTemplate.posBillPeriod;
    if (posBillPeriod > -1) {
        var BillPeriod = matcher[posBillPeriod];
        userTransaction.billPeriod = BillPeriod;
    }

    var posCity = msgTemplate.posCity;
    if (posCity > -1) {
        var City = matcher[posCity];
        userTransaction.city = City;
    }

    var posCreditLimit = msgTemplate.posCreditLimit;
    if (posCreditLimit > -1) {
        var CreditLimit = (matcher[posCreditLimit] || '').replace(",", "");
        userTransaction.creditLimit = (parseFloat(CreditLimit));
    }

    var posDate = msgTemplate.getPosDate;
    /*if (posDate > -1) {
        String Date = matcher.group(msgTemplate.getPosDate());
        userTransaction.setDate(msgTemplate.getParsedDate(Date));
    }*/

    var posDeliveryDate = msgTemplate.posDeliveryDate;
    if (posDeliveryDate > -1) {
        var DeliveryDate = matcher[posDeliveryDate];
        userTransaction.deliveryDate = (getParsedDate(DeliveryDate, msgTemplate.dateFormat, msgTemplate.alternateDateFormat));
    }

    var posDueDate = msgTemplate.posDueDate;

    if (posDueDate > -1) {
        var DueDate = matcher[posDueDate];
        userTransaction.dueDate = (getParsedDate(DueDate, msgTemplate.dateFormat, msgTemplate.alternateDateFormat, [])).toDate();
    }

    var posExpiryDate = msgTemplate.posExpiryDate;
    if (posExpiryDate > -1) {
        var ExpiryDate = matcher[posExpiryDate];
        userTransaction.expiryDate = (getParsedDate(ExpiryDate, msgTemplate.dateFormat, msgTemplate.alternateDateFormat));
    }

    var posLocation = msgTemplate.posLocation;
    if (posLocation > -1) {
        var Location = matcher[posLocation];
        userTransaction.location = Location;
    }

    var posMerchant = msgTemplate.posMerchant;


    var posMerchantAccountId = msgTemplate.posMerchantAccountId;
    if (posMerchantAccountId > -1) {
        var MerchantAccountId = matcher[posMerchantAccountId];
        userTransaction.merchantAccountId = (MerchantAccountId);
    }


    var posMinAmountDue = msgTemplate.posMinAmountDue;
    if (posMinAmountDue > -1) {
        var MinAmountDue = (matcher[posMinAmountDue] || '').replace(",", "");
        userTransaction.minAmountDue = (parseFloat(MinAmountDue));
    }

    var posTotAmountDue = msgTemplate.posTotAmountDue;
    if (posTotAmountDue > -1) {
        var TotalAmountdue = (matcher[posTotAmountDue] || '').replace(",", "");
        userTransaction.totAmountDue = (parseFloat(TotalAmountdue));
    }


    var posMinPurchaseAmount = msgTemplate.posMinPurchaseAmount;
    if (posMinPurchaseAmount > -1) {
        var MinPurchaseAmount = (matcher[posMinPurchaseAmount] || '').replace(",", "");
        userTransaction.minPurchaseAmount = (parseFloat(MinPurchaseAmount));
    }


    var posNotificationType = msgTemplate.posNotificationType;
    if (posNotificationType > -1) {
        var NotificationType = matcher[posNotificationType];
        userTransaction.notificationType = (NotificationType);
    }

    var posOfferAmount = msgTemplate.posOfferAmount;
    if (posOfferAmount > -1) {
        var OfferAmount = (matcher[posOfferAmount] || '').replace(",", "");
        userTransaction.offerAmount = (parseFloat(OfferAmount));
    }

    var posOfferType = msgTemplate.posOfferType;
    if (posOfferType > -1) {
        var OfferType = matcher[posOfferType];
        userTransaction.offerType = (OfferType);
    }

    var posOrderId = msgTemplate.posOrderId;
    if (posOrderId > -1) {
        var OrderId = matcher[posOrderId];
        userTransaction.orderId = (OrderId);
    }

    var posOutstanding = msgTemplate.posOutstanding;
    if (posOutstanding > -1) {
        var Outstanding = (matcher[posOutstanding] || '').replace(",", "");
        userTransaction.outstanding = (parseFloat(Outstanding));
    }

    var posPaymentType = msgTemplate.posPaymentType;
    if (posPaymentType > -1) {
        var PaymentType = matcher[posPaymentType];
        userTransaction.paymentType = (PaymentType);
    }

    var posReceiverAccountId = msgTemplate.posReceiverAccountId;
    if (posReceiverAccountId > -1) {
        var ReceiverAccountId = matcher[posReceiverAccountId];
        userTransaction.receiverAccountId = (ReceiverAccountId);
    }

    var posReceiverAccountType = msgTemplate.posReceiverAccountType;
    if (posReceiverAccountType > -1) {
        var ReceiverAccountType = matcher[posReceiverAccountType];
        userTransaction.receiverAccountType = (ReceiverAccountType);
    }

    var posReceiverBankName = msgTemplate.posReceiverBankName;
    if (posReceiverBankName > -1) {
        var ReceiverBankName = matcher[posReceiverBankName];
        userTransaction.receiverBankName = (ReceiverBankName);
    }

    var posReceiverName = msgTemplate.posReceiverName;
    if (posReceiverName > -1) {
        var ReceiverName = matcher[posReceiverName];
        userTransaction.receiver = (ReceiverName);
    }

    var posSenderAccountId = msgTemplate.posSenderAccountId;
    if (posSenderAccountId > -1) {
        var SenderAccountId = matcher[posSenderAccountId];
        userTransaction.senderAccountId = (SenderAccountId);
    }

    var posSenderAccountType = msgTemplate.posSenderAccountType;
    if (posSenderAccountType > -1) {
        var SenderAccountType = matcher[posSenderAccountType];
        userTransaction.senderAccountType = (SenderAccountType);
    }

    var posSenderBankName = msgTemplate.posSenderBankName;
    if (posSenderBankName > -1) {
        var SenderBankName = matcher[posSenderBankName];
        userTransaction.senderBankName = (SenderBankName);
    }

    var posSenderName = msgTemplate.posSenderName;
    if (posSenderName > -1) {
        var SenderName = matcher[posSenderName];
        userTransaction.senderName = (SenderName);
    }

    //        int posShipDate = msgTemplate.getPosShipDate();
    //        if (posShipDate > -1) {
    //            String ShipDate = matcher.group(msgTemplate.getPosShipDate());
    //            userTransaction.setShipDate(msgTemplate.getParsedDate(ShipDate));
    //        }

    var merchantName = msgTemplate.merchantName;
    if (merchantName != '') {
        // unavailableMerchants.add(merchantName);
        userTransaction.merchantName = (merchantName);
    }

    if (posMerchant > -1) {
        var Merchant = matcher[posMerchant];
        userTransaction.merchantName = (Merchant);
        // var isMerchantAvailable = false;
        // for (Merchant merchant:
        //  merchantCache) {
        //  if (merchant.getName().equals(Merchant)) {
        //      // if merchant available then set merchant id
        //      userTransaction.setMerchantId(merchant.getId());
        //      isMerchantAvailable = true;
        //      break;
        //  }
        // }

        // if (!isMerchantAvailable) {
        //  // add unavailable merchants in a list
        //  unavailableMerchants.add(Merchant);
        // }
    }
    userTransaction.txnType = (msgTemplate.txnType);
    userTransaction.smsId = (parsedSms.id);
    userTransaction.msgId = (parsedSms.id);
    userTransaction.address = ((parsedSms.sender + "").split('-').pop());
    userTransaction.date = moment((parsedSms.time || parsedSms.sender_timestamp)).toDate();
    userTransaction.smsText = (parsedSms.sender_message);
    userTransaction.bankName = (msgTemplate.bankName);
    userTransaction.accountType = (msgTemplate.accountType);
    userTransaction.patternId = (msgTemplate.id);
    userTransaction.userId = parsedSms.customer_id;
    var paymentType = msgTemplate.paymentType;

    if (paymentType != '') {
        userTransaction.paymentType = (paymentType);
        // for (Category category:
        //  categoryList) {

        //  paymentType = paymentType.replace("-", " ");
        //  if (category.getName().equalsIgnoreCase(paymentType)) {
        //      String categoryId = category.getCategoryId();

        //      userTransaction.setCategoryId(categoryId);
        //      break;
        //  }
        // }
    }
    userTransaction.txnType = (msgTemplate.txnType);
    // userTransaction.setAccountIdIfItNotExists(context);
    return userTransaction;
}

function insertPurchaseDataToDb(msgTemplate, matcher, msgDate,
    posAmount, purchasePosOrderId, posAwbNumber, posCourierName,
    posDeliveryDate, posProductName, posExpectedDate, smsText, customer_id) {

    var purchasesTable = new PurchasesTable();
    purchasesTable.uuid = uuid.v4();
    purchasesTable.seller_name = smsText;
    var sellerName = "",
        merchantName = "";
    var orderCount = 0,
        productNameCount = 0,
        awbCount = 0,
        expectedDateCount = 0,
        productNameAlreadyExist = 0,
        bitlyCount = 0;
    purchasesTable.regexId = msgTemplate._id.toString();
    purchasesTable.userId = customer_id;
    if (msgTemplate.posMerchantName > -1) {
        merchantName = matcher[msgTemplate.posMerchantName].trim();
        purchasesTable.merchat_name = merchantName.toUpperCase().trim();
    } else {
        merchantName = msgTemplate.merchantName;
        purchasesTable.merchat_name = merchantName.toUpperCase().trim();
    }
    if (msgTemplate.posOrderId > -1) {
        // orderCount = purchaseDao.isPurchaseRowExist(matcher.group(msgTemplate.getPosOrderId()));
    }
    if (msgTemplate.posProductName > -1) {
        var firstWord = "";
        try {
            var productName = matcher[msgTemplate.posProductName].trim();
            if (productName.indexOf(" ") >= 0) {
                var arr = productName.split(/\S+/);
                firstWord = arr[0];

                console.log("firstword", firstWord);
                // productNameCount = purchaseDao.isProductNameExist(firstWord);
                // productNameAlreadyExist = purchaseDao.isPurchaseAlreadyExist(firstWord, merchantName, "Approved");
            } else {
                // productNameCount = purchaseDao.isProductNameExist(productName);
                // productNameAlreadyExist = purchaseDao.isPurchaseAlreadyExist(productName, merchantName, "Approved");
            }
        } catch (e) {
            console.log(e.stack);
        }
    }
    if (msgTemplate.posAwbNumber > -1) {
        // awbCount = purchaseDao.isPurchaseRowExist(matcher.group(msgTemplate.getPosAwbNumber()));
    }

    if (msgTemplate.getPosExpectedDate > -1) {
        try {
            var expectedDate = matcher[msgTemplate.posExpectedDate];
            var simpleDateFormat = moment(expectedDate, dateFormat.toUpperCase());
            // expectedDateCount = purchaseDao.isExpectedDateExist(simpleDateFormat);
        } catch (e) {
            console.log(e.stack);
        }
    }

    if (orderCount > 0) {
        // purchasesTable.purchaseId = purchaseDao.getPurchaseId("order_id", matcher.group(msgTemplate.getPosOrderId()));
    } else if (productNameAlreadyExist > 1) {
        purchasesTable.purchaseId = uuid.v4();
    } else if (productNameCount > 0) {
        {
            var firstWord = "";
            var productName = matcher[msgTemplate.posProductName].trim();
            if (productName.indexOf(" ") >= 0) {
                var arr = productName.split(/\S+/);
                firstWord = arr[0];
                // purchasesTable.setPurchaseId(purchaseDao.getProductNamePurchaseId("product_name", firstWord));
            } else {
                // purchasesTable.setPurchaseId(purchaseDao.getProductNamePurchaseId("product_name", productName));
            }
        }
    } else if (awbCount > 0) {
        // purchasesTable.setPurchaseId(purchaseDao.getPurchaseId("awb_number", matcher.group(msgTemplate.getPosAwbNumber())));
    } else if (expectedDateCount > 0) {
        try {
            var date = moment(matcher[msgTemplate.posExpectedDate], msgTemplate.dateFormat.toUpperCase());
            var edate = date.format("yyyy-MM-dd HH:mm:ss.SSSSSS");
            // purchasesTable.setPurchaseId(purchaseDao.getPurchaseId("expected_date", edate));
        } catch (e) {
            console.log(e.stack);
        }
    } else { //new message
        purchasesTable.purchaseId = uuid.v4();
    }
    // unavailableMerchants.add(merchantName);
    purchasesTable.order_status = msgTemplate.orderStatus.trim();
    try {
        if (posAmount > -1) {
            var _amount = 0;
            var amount = matcher[msgTemplate.posAmount];
            if (amount.indexOf(",") >= 0) {
                _amount = parseFloat(amount.replace(",", ""));
            } else if (amount.indexOf(")") >= 0) {
                _amount = parseFloat(amount.replace(")", ""));
            } else {
                _amount = parseFloat(amount);
            }
            purchasesTable.order_amount = _amount;
        }
    } catch (e) {
        purchasesTable.order_amount = 0.0;
    }

    if (purchasePosOrderId > -1) {
        purchasesTable.orderId = matcher[msgTemplate.posOrderId];
    } else {
        purchasesTable.orderId = "";
    }
    if (posAwbNumber > -1) {
        purchasesTable.awb_number = matcher[msgTemplate.posAwbNumber];
    } else {
        purchasesTable.awb_number = "";
    }
    if (posCourierName > -1) {
        purchasesTable.courier_name = matcher[msgTemplate.posCourierName];
    } else {
        purchasesTable.courier_name = "";
    }
    if (posDeliveryDate > -1) {
        var deliveryDate = matcher[msgTemplate.posDeliveryDate];
        var first = deliveryDate.charAt(0).toUpperCase();
        if (deliveryDate.indexOf("today") >= 0) {
            purchasesTable.delivery_date = moment(msgDate, "dd MMM yy".toUpperCase()).toDate();
        } else {
            purchasesTable.delivery_date = first + deliveryDate.substring(1);
        }
    } else {
        purchasesTable.delivery_date = "";
    }
    if (posProductName > -1) {
        var productName = matcher[msgTemplate.posProductName].trim();
        if (productName.indexOf("'") >= 0) {
            productName = productName.replace("'", "");
        }
        purchasesTable.product_name = productName;
    } else {
        purchasesTable.product_name = "";
    }
    if (msgTemplate.posAltExpectedDate > -1) {
        purchasesTable.alt_expected_date = matcher[msgTemplate.posAltExpectedDate];
    }
    if (posExpectedDate > -1) {
        try {
            purchasesTable.expected_date = moment(msgTemplate.posExpectedDate, msgTemplate.dateFormat.toUpperCase()).toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }
    purchasesTable.msgDate = moment(msgDate).toDate();
    if (msgTemplate.posQuantity > -1) {
        purchasesTable.quantity = parseInt(matcher[msgTemplate.posQuantity]);
    }
    purchasesTable.msg_type = msgTemplate.msgType;
    if (msgTemplate.posManageLink > -1) {
        var bitly = matcher[msgTemplate.posManageLink].trim();
        if (bitly.indexOf(" ") >= 0) {
            bitly = bitly.replace(" ", "");
        }
        if (bitly.indexOf(".Than") >= 0) {
            bitly = bitly.replace(".Than", "");
        }
        purchasesTable.short_link = bitly.trim();
    }

    if (msgTemplate.posMovieName > -1) {
        purchasesTable.movieName = matcher[msgTemplate.posMovieName];
    }
    if (msgTemplate.posMovieDate > -1) {
        purchasesTable.movieDate = matcher[msgTemplate.posMovieDate];
    }
    if (msgTemplate.posCineplex > -1) {
        purchasesTable.cineplexName = matcher[msgTemplate.posCineplex];
    }
    try {
        if (msgTemplate.posSeats > -1) {
            purchasesTable.seat = parseInt(matcher[msgTemplate.posSeats].trim());
        }
    } catch (e) {
        purchasesTable.seat = 0;
    }

    if (msgTemplate.posSeatType > -1) {
        purchasesTable.seat_type = matcher[msgTemplate.posSeatType];
    }
    purchasesTable.msg_type = msgTemplate.msgType;
    // purchasesTable.userId(Prefs.getInSharedPreference(context, Constants.DEVICE_ID));
    // purchaseDao.createNewPurchaseEntry(purchasesTable);
    // if (!purchasesTable.getOrderStatus().equalsIgnoreCase("Movie Booking")) {
    //  if (mCallBack != null) {
    //      mCallBack.onPurchaseEntry(purchasesTable);
    //  }
    // }
    return purchasesTable;

}

function parseDate(dateString) {

    var currentYear = new Date().getFullYear()
    var parsed = moment(dateString, 'dd MMM'.toUpperCase());
    parsed.set('year', currentYear);
    return parsed;

}

function getTravelParseDate(dateFormat, dateString) {
    if (!dateFormat || dateFormat == '') {
        return null;
    }
    console.log(dateFormat, dateString);
    if (dateFormat == "dd MMM") {
        return parseDate(dateString);
    } else if (dateFormat == "HH:mm") {
        return moment(dateString, dateFormat);
    } else {
        console.log("before replace", dateFormat);
        dateFormat = dateFormat.toUpperCase().replace(':MM', ':mm').replace('AA', 'a').replace('TH', "S");
        console.log("after replace", dateFormat);
        return moment(dateString, dateFormat);
    }
}

function getTravelDateFromSmsDate(smsDate, travel) {

}

function getTravelDate(smsDate, travel) {
    console.log("getTravelDate", smsDate, travel);
    var travelYear = travel.year();
    console.log("TravelYear", travelYear);
    if (travelYear > 2000)
        return travel;

    var smsCalendar = moment(smsDate);
    var year = smsCalendar.year();
    console.log("SmsYear", year);
    travel.set('year', year);
    // If travel date is less than sms date then increment the travel year
    if (travel.isBefore(smsCalendar)) {
        travel.add('years', 1);
    }
    return travel;
}


function getFullDateTime(date, time) {
    console.log(date);
    console.log(time);

    var dateString = moment(new Date(date)).format('DD-MM-YYYY');
    var timeString = moment(new Date(time)).format('HH:mm');
    console.log("TAG", "getFullDateTime: " + dateString + " " + timeString);
    return moment(dateString + ' ' + timeString, 'DD-MM-YYYY HH:mm');
}


function getTravelTable(msgTemplate, matcher, parsedSmsData) {
    var travelTable = new TravelTable();
    var dateFormat = msgTemplate.dateFormat.toUpperCase().replace(':MM', ':mm').replace('AA', 'aa').replace('TH', "S");
    var timeFormat = msgTemplate.timeFormat;
    travelTable.merchantName = msgTemplate.merchantName;
    travelTable.bookingType = msgTemplate.bookingType;
    travelTable.msgId = parsedSmsData.id;
    travelTable.regexId = msgTemplate._id.toString();
    travelTable.isReturnTicket = msgTemplate.isReturn;
    var posPNR = msgTemplate.posPNR;
    var merchantCode = msgTemplate.merchantCode;
    if (merchantCode != '') {
        travelTable.merchantCode = merchantCode;
    }
    travelTable.uuid = uuid.v4();
    if (posPNR > -1) {
        var pnrNumber = matcher[msgTemplate.posPNR];
        travelTable.posPNR = pnrNumber;
    }
    var posTrainId = msgTemplate.posTrainId;
    if (posTrainId > -1) {
        var trainId = matcher[msgTemplate.posTrainId];
        travelTable.posTrainId = trainId;
    }
    travelTable.dateModified = new Date();

    //Implement logic for date with format dd MMM or dd MM or dd-MM
    var posDate = msgTemplate.posDate;
    var posTime = msgTemplate.posTime;
    if (posDate > -1 && posTime > -1) {
        var date = matcher[msgTemplate.posDate];
        var startTime = matcher[msgTemplate.posTime];
        var time = null;
        try {
            console.log("date ", date, " dateFormat ", dateFormat);
            var travelDate;
            if (dateFormat == 'DD-MM-YY' || dateFormat == 'DD/MM/YY' || dateFormat == 'DD.MM.YYYY' || dateFormat == 'DD-MM-YYYY' || dateFormat == 'DD-MM-YYYY HH:mm aa') {
                travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(date, dateFormat));
            } else {
                travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(date), dateFormat));
            }

            if ("N.A." != startTime) {
                console.log(startTime)
                time = getTravelParseDate(timeFormat, startTime);
            } else
                time = new Date();
            travelTable.startDate = getFullDateTime(travelDate, time).toDate();
        } catch (e) {
            try {
                var travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(date), 'DD-MM-YYYY'));
                if ("N.A." != startTime)
                    time = getTravelParseDate(timeFormat, startTime);
                else
                    time = new Date();
                travelTable.startDate = getFullDateTime(travelDate, time).toDate();
            } catch (e1) {

                console.log(e1.stack);
            }
            console.log(e.stack);
        }
    } else if (posDate > -1) {
        var date = matcher[msgTemplate.posDate];
        var time = null;
        try {
            console.log("date ", date, " dateFormat ", dateFormat);
            var travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(date), dateFormat));
            time = new Date();
            travelTable.startDate = getFullDateTime(travelDate, time).toDate();
        } catch (e) {
            console.log(e.stack);
            try {
                var travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(date), 'DD-MM-YYYY'));
                time = new Date();
                travelTable.startDate = getFullDateTime(travelDate, time).toDate();
            } catch (e1) {
                console.log(e1.stack);
            }
        }
    }

    var posClass = msgTemplate.posClass;
    if (posClass > -1) {
        var trainClass = matcher[msgTemplate.posClass];
        travelTable.posClass = trainClass;
    }
    var posSource = msgTemplate.posSource;
    if (posSource > -1) {
        var trainSource = matcher[msgTemplate.posSource];
        travelTable.posSource = trainSource;
    }
    var posDestination = msgTemplate.posDestination;
    if (posDestination > -1) {
        var trainDestination = matcher[msgTemplate.posDestination];
        travelTable.posDestination = trainDestination;
    }
    if (posTime > -1) {
        var trainTime = matcher[msgTemplate.posTime];
        try {
            if ("N.A." != trainTime) {
                console.log('Train : ', trainTime);
                var format = timeFormat;
                // Log.d(TAG, "timeFormat: " + format);
                travelTable.posTime = getTravelParseDate(format, trainTime).toDate();
            }
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posStatus = msgTemplate.posStatus;
    if (posStatus > -1) {
        var status = matcher[msgTemplate.posStatus];
        travelTable.posStatus = status;
    } else if (msgTemplate.bookingType != 'train') {
        travelTable.posStatus = " "; //(PNRStatusEnum.getStatus("Confirmed"));
    } else {
        var posSeatNo = msgTemplate.posSeatNo;
        if (posSeatNo > -1) {
            var seatNo = matcher[msgTemplate.posSeatNo];
            travelTable.posStatus = " "; //(PNRStatusEnum.getStatus(seatNo));
        } else {
            travelTable.posStatus = " ";
        }
    }

    var posCode = msgTemplate.posCode;
    if (posCode > -1) {
        var code = matcher[msgTemplate.posCode];
        travelTable.posCode = code;
    }

    var posHelpline = msgTemplate.posHelpline;
    if (posHelpline > -1) {
        var helpline = matcher[msgTemplate.posHelpline];
        travelTable.posHelpline = helpline;
    }

    var posAmount = msgTemplate.posAmount;
    if (posAmount > -1) {
        var totalBalance = matcher[msgTemplate.posAmount];
        travelTable.posTotalBalance = parseFloat(totalBalance);
    }

    var posCarNumber = msgTemplate.posCarNumber;
    if (posCarNumber > -1) {
        var carNumber = matcher[msgTemplate.posCarNumber];
        travelTable.posCarNumber = carNumber;
    }

    var posFlightId = msgTemplate.posFlightId;
    if (posFlightId > -1) {
        var flightId = matcher[msgTemplate.posFlightId];
        if (/^\d+$/.test(flightId)) {
            var posSRN = msgTemplate.posSRN;
            if (posSRN > -1) {
                var srnName = matcher[msgTemplate.posSRN];
                var travelType = "" //travelTypeDao.getMerchantCodeByName(srnName);
                if (travelType != null) {
                    var flightCode = travelTable.merchantCode;
                    flightId = flightCode + srnName;
                }
            }
        } else {
            if (flightId.indexOf(" ") >= 0) {
                flightId = flightId.replace(" ", "");
            } else if (flightId.indexOf("-") >= 0) {
                flightId = flightId.replace("-", "");
            }
        }

        console.log("FLIGHT", flightId);
        var merchantcode = flightId.substring(0, 2);
        if (merchantcode != "") {
            travelTable.merchantCode = merchantcode;
        }
        travelTable.posFlightId = flightId;
    }

    var posArrivalTime = msgTemplate.posArrivalTime;
    if (posArrivalTime > -1) {
        var arrivalTime = matcher[msgTemplate.posArrivalTime];
        try {
            var format = DateUtil.determineDateFormat(arrivalTime);
            console.log("timeFormat: " + format);
            travelTable.posArrivalTime = getTravelParseDate(format, arrivalTime).toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }

    var posEndDate = msgTemplate.posEndDate;
    if (posEndDate > -1) {
        var endDate = matcher[msgTemplate.posEndDate];
        try {
            travelTable.posEndDate = getTravelParseDate(dateFormat, endDate).toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posCarrieName = msgTemplate.posCarrieName;
    if (posCarrieName > -1) {
        var carrieName = matcher[msgTemplate.posCarrieName];
        travelTable.posCarrieName = carrieName;
    }
    var posBookingId = msgTemplate.posBookingId;
    if (posBookingId > -1) {
        var BookingId = matcher[msgTemplate.posBookingId];
        travelTable.posBookingId = BookingId;
    }

    var posSeatNo = msgTemplate.posSeatNo;
    if (posSeatNo > -1) {
        var seatNo = matcher[msgTemplate.posSeatNo];
        travelTable.posSeatNo = seatNo;
    }

    var posDuration = msgTemplate.posDuration;
    if (posDuration > -1) {
        var duration = matcher[msgTemplate.posDuration];
        travelTable.posDuration = duration;
    }

    var gateNo = msgTemplate.posGateNo;
    if (gateNo > -1) {
        var gate = matcher[msgTemplate.posGateNo];
        travelTable.gateNo = gate;
    }

    var posLandMark = msgTemplate.posLandMark;
    if (posLandMark > -1) {
        var landmark = matcher[msgTemplate.posLandMark];
        travelTable.landMark = landmark;
    }

    var senderPos = msgTemplate.posSenderName;
    if (senderPos > -1) {
        var senderName = matcher[msgTemplate.posSenderName];
        travelTable.senderName = senderName;
    }

    var posReturnPnr = msgTemplate.posReturnPNR;
    if (posReturnPnr > -1) {
        try {
            var returnPnr = matcher[msgTemplate.posReturnPNR];
            travelTable.posReturnPNR = returnPnr;
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posReturnFlightId = msgTemplate.posReturnFlightId;
    if (posReturnFlightId > -1) {
        try {
            var returnFlightId = matcher[msgTemplate.posReturnFlightId];
            travelTable.posReturnFlightId = returnFlightId;
        } catch (e) {
            console.log(e.stack);
        }
    }

    var posReturnDate = msgTemplate.posReturnDate;
    if (posReturnDate > -1) {
        var returnDate = matcher[msgTemplate.posReturnDate];
        try {
            var travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(returnDate.trim()), dateFormat));
            travelTable.posReturnDate = travelDate.toDate();
            console.log("getTravelTable: " + travelDate);
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posReturnEndDate = msgTemplate.posReturnEndDate;
    if (posReturnEndDate > -1) {
        try {
            var returnEndDate = matcher[msgTemplate.posReturnEndDate];
            var travelDate = getTravelDate(new Date(parsedSmsData.sender_timestamp), moment(new Date(returnEndDate.trim()), dateFormat));
            travelTable.posReturnEndDate = travelDate.toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posReturnSource = msgTemplate.posReturnSource;
    if (posReturnSource > -1) {
        try {
            var returnSource = matcher[msgTemplate.posReturnSource];
            travelTable.posReturnSource = returnSource;
        } catch (e) {
            console.log(e.stack);
        }
    }
    var posReturnDestination = msgTemplate.posReturnDestination;
    if (posReturnDestination > -1) {
        try {
            var returnDestination = matcher[msgTemplate.posReturnDestination];
            travelTable.posReturnDestination = returnDestination;
        } catch (e) {
            console.log(e.stack);
        }
    }


    var posReturnTime = msgTemplate.posReturnTime;
    if (posReturnTime > -1) {
        var returnTime = matcher[msgTemplate.posReturnTime];
        try {
            travelTable.posReturnTime = getTravelParseDate(timeFormat, returnTime).toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }

    var posReturnArrivalTime = msgTemplate.posReturnArrivalTime;
    if (posReturnArrivalTime > -1) {
        var arrivalTime = matcher[msgTemplate.posReturnArrivalTime];
        try {
            travelTable.posReturnArrivalTime = getTravelParseDate(timeFormat, arrivalTime).toDate();
        } catch (e) {
            console.log(e.stack);
        }
    }

    travelTable.userId = parsedSmsData.customer_id;

    return travelTable;
}

// function updateTravelData(msgTemplate, matcher, parsedSmsData) {
//  String pnr = "", flightCode = "";
//  TravelTable travelTable = null;
//  String dateFormat = msgTemplate.getDateFormat();
//  String timeFormat = msgTemplate.getTimeFormat();
//  int pnrNumber = msgTemplate.getPosPNR();
//  if (pnrNumber > -1) {
//      pnr = matcher.group(msgTemplate.getPosPNR());
//  }
//  int flightId = msgTemplate.getPosFlightId();
//  if (flightId > -1) {
//      flightCode = matcher.group(msgTemplate.getPosFlightId());
//  }
//  if (!TextUtils.isEmpty(pnr)) {
//      travelTable = travelDao.getTravelByPnr(pnr);
//  } else if (!TextUtils.isEmpty(flightCode)) {
//      travelTable = travelDao.getTravelByFlightCode(flightCode);
//  }
//  if (travelTable == null) {
//      return null;
//  }

//  travelTable.setDateModified(new Date());
//  int posDate = msgTemplate.getPosDate();
//  int posTime = msgTemplate.getPosTime();
//  if (posDate > -1 && posTime > -1) {
//      String Date = matcher.group(msgTemplate.getPosDate());
//      String startTime = matcher.group(msgTemplate.getPosTime());
//      try {
//          Date newDate = msgTemplate.getTravelParseDate(dateFormat, Date);
//          Date time = msgTemplate.getTravelParseDate(timeFormat, startTime);
//          travelTable.setStartDate(Utility.getFullDateTime(newDate, time));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }
//  int posClass = msgTemplate.getPosClass();
//  if (posClass > -1) {
//      String trainClass = matcher.group(msgTemplate.getPosClass());
//      travelTable.setPosClass(trainClass);
//  }
//  int posSource = msgTemplate.getPosSource();
//  if (posSource > -1) {
//      String source = matcher.group(msgTemplate.getPosSource());
//      travelTable.setPosSource(source);
//  }
//  int posDestination = msgTemplate.getPosDestination();
//  if (posDestination > -1) {
//      String destination = matcher.group(msgTemplate.getPosDestination());
//      travelTable.setPosDestination(destination);
//  }
//  if (posTime > -1) {
//      String startTime = matcher.group(msgTemplate.getPosTime());
//      try {
//          String format = DateUtil.determineDateFormat(startTime);
//          travelTable.setPosTime(msgTemplate.getTravelParseDate(format, startTime));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }
//  int posStatus = msgTemplate.getPosStatus();
//  if (posStatus > -1) {
//      String status = matcher.group(msgTemplate.getPosStatus());
//      travelTable.setPosStatus(status);
//  } else if (!msgTemplate.getBookingType().equalsIgnoreCase(Constants.TRAVEL_TRAIN)) {
//      travelTable.setPosStatus(PNRStatusEnum.getStatus("Confirmed"));
//  }

//  int posAmount = msgTemplate.getPosAmount();
//  if (posAmount > -1) {
//      String totalBalance = matcher.group(msgTemplate.getPosAmount());
//      travelTable.setPosTotalBalance(Double.parseDouble(totalBalance));
//  }

//  int posArrivalTime = msgTemplate.getPosArrivalTime();
//  if (posArrivalTime > -1) {
//      String arrivalTime = matcher.group(msgTemplate.getPosArrivalTime());
//      try {
//          String format = DateUtil.determineDateFormat(arrivalTime);
//          Log.d(TAG, "timeFormat: " + format);
//          travelTable.setPosArrivalTime(msgTemplate.getTravelParseDate(format, arrivalTime));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }

//  int posEndDate = msgTemplate.getPosEndDate();
//  if (posEndDate > -1) {
//      String endDate = matcher.group(msgTemplate.getPosEndDate());
//      try {
//          travelTable.setPosEndDate(msgTemplate.getTravelParseDate(dateFormat, endDate));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }
//  int posCarrieName = msgTemplate.getPosCarrieName();
//  if (posCarrieName > -1) {
//      String carrieName = matcher.group(msgTemplate.getPosCarrieName());
//      travelTable.setPosCarrieName(carrieName);
//  }

//  int posBookingId = msgTemplate.getPosBookingId();
//  if (posBookingId > -1) {
//      String BookingId = matcher.group(msgTemplate.getPosBookingId());
//      travelTable.setPosBookingId(BookingId);
//  }

//  int posSeatNo = msgTemplate.getPosSeatNo();
//  if (posSeatNo > -1) {
//      String seatNo = matcher.group(msgTemplate.getPosSeatNo());
//      travelTable.setPosSeatNo(seatNo);
//  }

//  int posDuration = msgTemplate.getPosDuration();
//  if (posDuration > -1) {
//      String duration = matcher.group(msgTemplate.getPosDuration());
//      travelTable.setPosDuration(duration);
//  }

//  int gateNo = msgTemplate.getPosGateNo();
//  if (gateNo > -1) {
//      String gate = matcher.group(msgTemplate.getPosGateNo());
//      travelTable.setGateNo(gate);
//  }

//  int posLandMark = msgTemplate.getPosLandMark();
//  if (posLandMark > -1) {
//      String landmark = matcher.group(msgTemplate.getPosLandMark());
//      travelTable.setLandMark(landmark);
//  }

//  int senderPos = msgTemplate.getPosSenderName();
//  if (senderPos > -1) {
//      String senderName = matcher.group(msgTemplate.getPosSenderName());
//      travelTable.setSenderName(senderName);
//  }

//  int posReturnPnr = msgTemplate.getPosReturnPNR();
//  if (posReturnPnr > -1) {
//      String returnPnr = matcher.group(msgTemplate.getPosReturnPNR());
//      travelTable.setPosReturnPNR(returnPnr);
//  }
//  int posReturnFlightId = msgTemplate.getPosReturnFlightId();
//  if (posReturnFlightId > -1) {
//      try {
//          String returnFlightId = matcher.group(msgTemplate.getPosReturnFlightId());
//          travelTable.setPosReturnFlightId(returnFlightId);
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }

//  int posReturnDate = msgTemplate.getPosReturnDate();
//  if (posReturnDate > -1) {
//      String returnDate = matcher.group(msgTemplate.getPosReturnDate());
//      try {
//          Date travelDate = Utility.getTravelDate(parsedSmsData.getSmsTime(), new SimpleDateFormat(dateFormat, Locale.US).parse(returnDate.trim()));
//          travelTable.setPosReturnDate(travelDate);
//          Log.d(TAG, "getTravelTable: " + travelDate);
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }
//  int posReturnEndDate = msgTemplate.getPosReturnEndDate();
//  if (posReturnEndDate > -1) {
//      try {
//          String returnEndDate = matcher.group(msgTemplate.getPosReturnEndDate());
//          Date travelDate = Utility.getTravelDate(parsedSmsData.getSmsTime(), new SimpleDateFormat(dateFormat, Locale.US).parse(returnEndDate.trim()));
//          travelTable.setPosReturnEndDate(travelDate);
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }
//  int posReturnSource = msgTemplate.getPosReturnSource();
//  if (posReturnSource > -1) {
//      String returnSource = matcher.group(msgTemplate.getPosReturnSource());
//      travelTable.setPosReturnSource(returnSource);
//  }
//  int posReturnDestination = msgTemplate.getPosReturnDestination();
//  if (posReturnDestination > -1) {
//      String returnDestination = matcher.group(msgTemplate.getPosReturnDestination());
//      travelTable.setPosReturnDestination(returnDestination);
//  }


//  int posReturnTime = msgTemplate.getPosReturnTime();
//  if (posReturnTime > -1) {
//      String returnTime = matcher.group(msgTemplate.getPosReturnTime());
//      try {
//          String format = DateUtil.determineDateFormat(returnTime);
//          Log.d(TAG, "timeFormat: " + format);
//          travelTable.setPosReturnTime(msgTemplate.getTravelParseDate(format, returnTime));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }

//  int posReturnArrivalTime = msgTemplate.getPosReturnArrivalTime();
//  if (posReturnArrivalTime > -1) {
//      String arrivalTime = matcher.group(msgTemplate.getPosReturnArrivalTime());
//      try {
//          String format = DateUtil.determineDateFormat(arrivalTime);
//          Log.d(TAG, "timeFormat: " + format);
//          travelTable.setPosReturnArrivalTime(msgTemplate.getTravelParseDate(format, arrivalTime));
//      } catch (Exception e) {
//          e.printStackTrace();
//      }
//  }

//  int posSourceTerminal = msgTemplate.getPosSourceTerminal();
//  if (posSourceTerminal > -1) {
//      String sourceTerminal = matcher.group(msgTemplate.getPosSourceTerminal());
//      travelTable.setOriginTerminal(sourceTerminal);
//  }

//  int posDestinationTerminal = msgTemplate.getPosDestinationTerminal();
//  if (posDestinationTerminal > -1) {
//      String destinationTerminal = matcher.group(msgTemplate.getPosDestinationTerminal());
//      travelTable.setDestTerminal(destinationTerminal);
//  }

//  return travelTable;
// }

module.exports = Parser;