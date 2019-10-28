var tachyon = require('./index');
var proxyFile = require('./proxy-file');

exports.handler = function(event, context, callback) {
	var region = process.env.S3_REGION;
	var bucket = process.env.S3_BUCKET;
	var key = decodeURIComponent(event.path.substring(1));
	key = key.replace( '/uploads/tachyon/', '/uploads/' );
	var args = event.queryStringParameters || {};
	if ( typeof args.webp === 'undefined' ) {
		args.webp = !!event.headers['X-WebP'];
	}
	return tachyon.s3({ region: region, bucket: bucket }, key, args, function(
		err,
		data,
		info
	) {
		if (err) {
			if (err.message === 'fallback-to-original') {
				return proxyFile(region, bucket, key, callback);
			} else if ( err.code === 'AccessDenied' ) {
				// An AccessDenied error means the file is either protected, or doesn't exist.
				// We don't get a NotFound error because Tachyon makes unauthenticated calls
				// so S3.
				var resp = {
					statusCode: 404,
					body: "File not found.",
					isBase64Encoded: false,
				};
				return callback(null, resp);
			}
			return context.fail(err);
		}
		var resp = {
			statusCode: 200,
			headers: {
				'Content-Type': 'image/' + info.format,
				'Cache-Control': 'max-age=31536000',
				'Last-Modified': (new Date()).toUTCString(),
			},
			body: new Buffer(data).toString('base64'),
			isBase64Encoded: true,
		};
		callback(null, resp);

		data = null;
		info = null;
		err = null;
	});
};
