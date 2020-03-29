var ObjectID = require('mongodb').ObjectID;
module.exports.PurchasesTable = function() {
	return {
		"_id": ObjectID(),
		"awb_number": "",
		"courier_name": "",
		"date_modified": Date.now(),
		"delivery_date": '',
		"expected_date": "",
		"merchant_name": "",
		"msgDate": "",
		"msg_type": "purchase",
		"order_amount": 0,
		"order_id": "",
		"order_status": "",
		"product_name": "",
		"purchaseId": "",
		"quantity": 1,
		"seat": 0,
		"seller_name": "",
		"short_link": "",
		"userId": "",
		"uuid": "",
		"category": "purchases",
		"authToken": "",
		"regexId":"",
		"date_created": Date.now(),
		"saveTime": Date.now()

	}
}