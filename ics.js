/* Download ics feeds provided in data/data.json
 * Prerequisites : run app.js first
 */

 var fs = require('fs');
 var http = require('http');
 var https = require('https');
 var mkdirp = require('mkdirp');

var callback = function(response, stream) {
	var str = '';

	response.on('data', function(chunk) {
		str += chunk;
	});

	response.on('end', function() {
		stream.write(str);
	});
}

mkdirp('data/ics', function (err) {
	if (err)
		console.log('Unable to create folder ' + err);
	fs.readFile('data/data.json', 'utf8', function(err, data) {
		if (err) throw err;
		console.log("Lines count : " + data.split(/\r\n|\r|\n/).length);
		var icsLinks = data.match(/http[^ ]*\.ics/g);
		console.log("All ics links : \n" + icsLinks);
		icsLinks.forEach(function(v, i) {
			console.log(v);
			var protocol;
			if (v.indexOf('https') != -1) {
				protocol = https;
			} else {
				protocol = http;
			}
			var stream = fs.createWriteStream('data/ics/' + i);
			stream.on('open', function() {		
				protocol.request(v, function(response) {
					callback(response, stream);
				}).on('error', function(e) {
					console.log(v + ' : ' + e);	
				}).end();
			});
		});
	})
});
