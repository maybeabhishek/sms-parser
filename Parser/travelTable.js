var ObjectID = require('mongodb').ObjectID;
module.exports.TravelTable = function() {
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