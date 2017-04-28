var AWS = require('aws-sdk');

function sendOriginal(region, bucket, key, callback) {
	var s3 = new AWS.S3(Object.assign({ region: region }));
	return s3.makeUnauthenticatedRequest(
		'getObject',
		{ Bucket: bucket, Key: key },
		function(err, data) {
			if (err) {
				return callback(err);
			}

			var resp = {
				statusCode: 200,
				headers: {
					'Content-Type': data.ContentType,
				},
				body: new Buffer(data.Body).toString('base64'),
				isBase64Encoded: true,
			};

			callback(null, resp);
		}
	);
}

module.exports = sendOriginal
