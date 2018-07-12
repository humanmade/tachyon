var sharp = require('sharp'),
	AWS = require('aws-sdk'),
	path = require('path'),
	isAnimated = require('animated-gif-detector'),
	smartcrop = require('smartcrop-sharp');

var regions = {};

module.exports = {};

module.exports.s3 = function(config, key, args, callback) {
	AWS.config.region = config.region;

	var s3config = {};
	if (config.endpoint) {
		s3config.endpoint = config.endpoint;
		s3config.s3ForcePathStyle = true;
	}

	if (!regions[config.region]) {
		regions[config.region] = new AWS.S3(
			Object.assign({ region: config.region }, s3config)
		);
	}
	var s3 = regions[config.region];

	return s3.makeUnauthenticatedRequest(
		'getObject',
		{ Bucket: config.bucket, Key: key },
		function(err, data) {
			if (err) {
				return callback(err);
			}

			args.key = key;

			return module.exports.resizeBuffer(data.Body, args, callback);
		}
	);
};

var getDimArray = function( dims ) {
	return ( typeof dims === 'string'
		? dims.split(',')
		: dims
	).map(function(v) {
		return Number(v) || null;
	});
}

module.exports.resizeBuffer = function(buffer, args, callback) {


	return new Promise(function(resolve, reject) {
		try {
			var image = sharp(buffer).withMetadata();
			var metadata = function(crop) {
				return image.metadata(function(err, metadata) {
					if (err) {
						reject(err);
						if (callback) {
							callback(err);
						}
						return;
					}

					// auto rotate based on orientation exif data
					image.rotate();

					// convert gifs to pngs unless animated
					if (
						args.key &&
						path.extname(args.key).toLowerCase() === '.gif'
					) {
						if (isAnimated(buffer)) {
							return callback(new Error('fallback-to-original'));
						} else {
							image.png();
						}
					}

					// crop (assumes crop data from original)
					if (args.crop && !args.crop.match(/(smart|attention|entropy)/)) {
						var cropValues =
							typeof args.crop === 'string'
								? args.crop.split(',')
								: args.crop;

						// convert percentages to px values
						cropValues = cropValues.map(function(value, index) {
							if (value.indexOf('px') > -1) {
								return Number(value.substr(0, value.length - 2));
							} else {
								return Number(
									Number(
										metadata[index % 2 ? 'height' : 'width'] *
											(value / 100)
									).toFixed(0)
								);
							}
						});

						image.extract({
							left: cropValues[0],
							top: cropValues[1],
							width: cropValues[2],
							height: cropValues[3],
						});
					}

					// resize
					if (args.resize) {
						args.resize = getDimArray( args.resize );

						// apply cropping strategies
						if ( args.crop === 'attention' ) {
							image.crop( sharp.strategy.attention );
						}
						if ( args.crop === 'entropy' ) {
							image.crop( sharp.strategy.entropy );
						}
						if ( args.crop === 'smart' && crop ) {
							image.extract({
								left: crop.x,
								top: crop.y,
								width: crop.width,
								height: crop.height,
							});
						}
						if ( args.gravity ) {
							image.crop( args.gravity );
						}

						// apply the resize
						image.resize.apply(
							image,
							args.resize
						);
					} else if (args.fit) {
						args.fit = getDimArray( args.fit );
						image.resize.apply(
							image,
							args.fit
						);
						image.max();
					} else if (args.lb) {
						args.lb = getDimArray( args.lb );
						image.resize.apply(
							image,
							args.lb.map(function(v) {
								return Number(v) || null;
							})
						);

						// default to a black background to replicate Photon API behaviour
						// when no background colour specified
						if (!args.background) {
							args.background = 'black';
						}
						image.background(args.background);
						image.embed();
					} else if (args.w || args.h) {
						image.resize(
							Number(args.w) || null,
							Number(args.h) || null
						);
						if (!args.crop) {
							image.max();
						}
					}

					// allow override of compression quality
					if (args.webp) {
						image.webp({
							quality: args.quality
								? Math.min(Math.max(Number(args.quality), 0), 100)
								: 80,
						});
					} else if (metadata.format === 'jpeg' && args.quality) {
						image.jpeg({
							quality: Math.min(
								Math.max(Number(args.quality), 0),
								100
							),
						});
					}

					// send image
					return image.toBuffer(function(err, _data, info) {
						if (err) {
							reject(err);
							if (callback) {
								callback(err);
							}
							return;
						}

						resolve({ data: _data, info: info });
						if (callback) {
							callback(err, _data, info);
						}
						return;
					});
				});
			}

			// handle smartcrop promise
			if ( args.crop === 'smart' && args.resize ) {
				args.resize = getDimArray( args.resize );
				return smartcrop.crop(buffer, { width: args.resize[0], height: args.resize[1] })
					.then(function(result) {
						return metadata(result.topCrop);
					});
			}

			return metadata();
		} catch (err) {
			reject(err);
			callback(err);
		}
	});
};
