/** This script downloads the directory.json file from api.freifunk.net
 *  and copy all communities json data into data.json (by following provided links)
 */

var http = require('http');
var https = require('https');
var mkdirp = require('mkdirp');
var fs =  require('fs');
var options = {
	hostname : 'raw.githubusercontent.com',
	path : '/freifunk/directory.api.freifunk.net/master/directory.json',
	port : 443,
	method : 'GET'
};
var callback2 = function(response, stream) {
	var str = '';

	response.on('data', function(chunk) {
		str += chunk;
	});

	response.on('end', function() {
		stream.write(str);
	});

}
var callback =  function(response) {
	var str = '';
	response.on('data', function(chunk) {
		str += chunk;
	});

	response.on('end', function() {
		var stream = fs.createWriteStream('data/directory.json');
		stream.once('open', function(fd) {
			stream.write(str);
		});
		var obj = JSON.parse(str);
		var stream2 = fs.createWriteStream('data/data.json');
		stream.once('open', function(fd) {
			for (var p in obj) {
				var protocol;
				if (obj[p].indexOf('https') != -1) {
					protocol = https;
				} else {
					protocol = http;
				}
				protocol.request(obj[p], function(response) {
					callback2(response, stream2);
				}).on('error', function(e) {
					console.log(obj[p] + ' : ' + e);	
				}).end();
			}
			stream.write(str);
		})
	});
};
mkdirp('data', function (err) {
	if (err)
		console.log('Unable to create folder ' + err);
});
var req = https.request(options, callback);

req.on('error', function(e) {
  console.error(e);
});

req.end();