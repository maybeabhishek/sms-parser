var ObjectID = require('mongodb').ObjectID;
module.exports.UserBill = function() {
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