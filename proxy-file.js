var AWS = require('aws-sdk');

var authenticatedRequest = !!process.env.S3_AUTHENTICATED_REQUEST

function sendOriginal(region, bucket, key, callback) {
	var s3 = new AWS.S3(Object.assign({ region: region }));
	var s3Request = authenticatedRequest ? s3.makeRequest : s3.makeUnauthenticatedRequest
	return s3Request(
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
				body: Buffer.from(data.Body).toString('base64'),
				isBase64Encoded: true,
			};

			callback(null, resp);
		}
	);
}

module.exports = sendOriginal;
