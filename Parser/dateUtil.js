var dateUtil = {};
var moment = require('moment');
dateUtil.dateFormats = {
	"^\\d{1,2}/\\d{1,2}/\\d{2}$": "dd/MM/yy",
	"^\\d{1,2}-\\d{1,2}-\\d{2}\\s\\d{1,2}:\\d{1,2}:\\d{1,2}$": "dd-MM-yy HH:mm:ss",
	"^[a-z]{3}\\s\\d{1,2}\\s[a-z]{3}\\s\\d{2}$": "EEE dd MMM yy",
	"^\\d{1,2}-[A-Z]{3}-\\d{4}$": "dd-MMM-yyyy",
	"^\\d{14}$": "yyyyMMddHHmmss",
	"^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$": "yyyy/MM/dd HH:mm:ss",
	"^\\d{4}": "HHmm",
	"^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}$": "dd MMMM yyyy",
	"^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}$": "yyyy-MM-dd HH:mm",
	"^\\d{12}$": "yyyyMMddHHmm",
	"^\\d{1,2}'[th]{1,2}'\\s[A-Z]{1,3}\\s\\d{4}$": "dd'th' MMM yyyy",
	"^\\d{1,2}\\d{1,2}\\d{1,4}$": "ddMMyyyy",
	"^\\d{8}$": "yyyyMMdd",
	"^\\d{1,2}\\/\\d{1,2}\\/\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}\\s[a-z]{1}$": "dd/MM/yyyy hh:mm:ss a",
	"^\\d{1,2}-\\d{1,2}-\\d{4}$": "d-M-yyyy",
	"^\\d{8}\\s\\d{6}$": "yyyyMMdd HHmmss",
	"^\\d{2}-[A-Z]{1,3}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}$": "dd-MMM-yy HH:mm:ss",
	"^\\d{2}\\d{2}\\d{2}$": "ddMMyy",
	"^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}$": "dd MMMM yyyy HH:mm",
	"^\\d{1,2}\\s[a-z]{3}\\s\\d{4}$": "dd MMM yyyy",
	"^\\d{1,2}\\s[a-z]{3}\\s\\d{2}$": "dd MMM yy",
	"^\\d{1,2}:\\d{1,2}\\s[a-z]{1}$": "hh:mm a",
	"^\\d{1}\\/\\d{1}\\/\\d{4}$": "d/M/yyyy",
	"^\\d{1,2}-[A-Z]{1,3}-\\d{2}\\s\\d{2}:\\d{2}$": "dd-MMM-yy HH:mm",
	"^\\d{1,2}-[A-Z]{3}-\\d{1,4}\\s\\d{1,2}:\\d{1,2}:\\d{1,2}$": "dd-MM-yy HH:mm:ss",
	"^\\d{2}-\\d{1,4}$": "MM-yyyy",
	"^\\d{1,2}'[st]{1,2}'\\s[A-Z]{1,3}\\s\\d{4}$": "dd'st' MMM yyyy",
	"^\\d{4}/\\d{1,2}/\\d{1,2}$": "yyyy/MM/dd",
	"^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}:\\d{3}$": "dd-MM-yyyy HH:mm:sss",
	"^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$": "dd MMM yyyy HH:mm:ss",
	"^\\d{4}-\\d{1,2}-\\d{1,2}$": "yyyy-MM-dd",
	"^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$": "dd MMMM yyyy HH:mm:ss",
	"^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}$": "dd-MM-yyyy HH:mm",
	"^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$": "dd-MM-yyyy HH:mm:ss",
	"^\\d{1,2}\\s[a-z]{3}": "dd MMM",
	"^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$": "yyyy-MM-dd HH:mm:ss",
	"^[A-Z]{1,3}\\s\\d{2},\\s\\d{1,4}$": "MMM dd, yyyy",
	"^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}$": "dd MMM yyyy HH:mm",
	"^\\d{1,2}\\/\\d{1,2}\\/\\d{4}$": "dd/MM/yyyy",
	"^\\d{1,2}\\/\\d{1,2}\\/\\d{4}\\s\\d{1,2}:\\d{1,2}\\s[a-z]{1}$": "dd/MM/yyyy HH:mm a",
	"^\\d{1,4}\\/\\d{1,2}\\d\\/\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\s[a-z]$": "yyyy/MM/dd HH:mm:ss a",
	"^\\d{1,2}-[A-Z]{3}$": "dd-MMM",
	"^\\d{1,2}/\\d{1,2}/\\d{4}$": "MM/dd/yyyy",
	"^\\d{1,2}:\\d{1,2}": "HH:mm",
	"^\\d{1,2}-[A-Z]{1,3}-\\d{1,4}\\s\\d{2}:\\d{2}$": "dd-MMM-yyyy HH:mm",
	"^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$": "MM/dd/yyyy HH:mm:ss",
	"^\\d{1,2}:\\d{1,2}\\s[a-z]{2}": "HH:mm aa",
	"^\\d{1,2}-\\d{1,2}-\\d{4}\\/\\d{1,2}:\\d{2}:\\d{2}$": "dd-MM-yyyy/HH:mm:ss",
	"^\\d{8}\\s\\d{4}$": "yyyyMMdd HHmm",
	"^\\d{1,2}.\\d{1,2}.\\d{1,4}$": "dd.MM.yyyy",
	"^\\d{1,2}-[a-z]{3}-\\d{2}$": "dd-MMM-yy",
	"^\\d{1,2}[A-Z]{3},\\s\\d{1,2}:\\d{1,2}\\s[a-z]{1}$": "ddMMM, hh:mm a",
	"^\\d{1,2}-\\d{1,2}-\\d{2}$": "dd-MM-yy",
	"^\\d{2}-[A-Z]{1,8}-\\d{1,4}$": "dd-MMMM-yyyy",
	"^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}$": "MM/dd/yyyy HH:mm",
	"^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}$": "yyyy/MM/dd HH:mm"
}

dateUtil.determineDateFormat = function(string) {

	var regexes = Object.keys(dateUtil.dateFormats);

	for (var i = 0; i < regexes.length; i++) {
		if (new RegExp(regexes[i]).test(string)) {
			return dateUtil.dateFormats[regexes[i]];
		}
	}

	return null; // Unknown format.
}

console.log(moment('09 January 2017', 'DD MMM YYYY'));

module.exports = dateUtil;