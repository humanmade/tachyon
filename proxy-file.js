const AWS = require( 'aws-sdk' );

const authenticatedRequest = !!process.env.S3_AUTHENTICATED_REQUEST ? process.env.S3_AUTHENTICATED_REQUEST.toLowerCase() === 'true' : false;

function sendOriginal( config, bucket, key, callback ) {
	const s3 = new AWS.S3(config);

	let request;
	if ( authenticatedRequest ) {
		request = s3.makeRequest( 'getObject', { Bucket: bucket, Key: key } );
	} else {
		request = s3.makeUnauthenticatedRequest( 'getObject', { Bucket: bucket, Key: key } );
	}

	request.send( function( err, data ) {
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
	} );

	return request;
}

module.exports = sendOriginal;
