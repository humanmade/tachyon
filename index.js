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

var getDimArray = function( dims, zoom ) {
	var dimArr = typeof dims === 'string' ? dims.split(',') : dims;
	zoom = zoom || 1;
	return dimArr.map(function(v) {
		return Math.round((Number(v) * zoom)) || null;
	});
}

var clamp = function( val, min, max ) {
	return Math.min( Math.max( Number( val ), min ), max );
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
					if (args.crop) {
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

					// get zoom value
					var zoom = parseFloat( args.zoom ) || 1;

					// resize
					if (args.resize) {
						// apply smart crop if available
						if ( args.crop_strategy === 'smart' && crop ) {
							image.extract({
								left: crop.x,
								top: crop.y,
								width: crop.width,
								height: crop.height,
							});
						}

						// apply the resize
						args.resize = getDimArray( args.resize, zoom );
						image.resize({
							width: args.resize[0],
							height: args.resize[1],
							withoutEnlargement: true,
							position: ( args.crop_strategy !== 'smart' && args.crop_strategy ) || args.gravity || 'centre',
						});
					} else if (args.fit) {
						args.fit = getDimArray( args.fit, zoom );
						image.resize({
							width: args.fit[0],
							height: args.fit[1],
							fit: 'inside',
							withoutEnlargement: true,
						});
					} else if (args.lb) {
						args.lb = getDimArray( args.lb, zoom );
						image.resize({
							width: args.lb[0],
							height: args.lb[1],
							fit: 'contain',
							// default to a black background to replicate Photon API behaviour
							// when no background colour specified
							background: args.background || 'black',
							withoutEnlargement: true,
						});
					} else if (args.w || args.h) {
						image.resize({
							width: (Number(args.w) * zoom) || null,
							height: (Number( args.h ) * zoom) || null,
							fit: args.crop ? 'cover' : 'inside',
							withoutEnlargement: true,
						});
					}

					// return a default compression value based on a logarithmic scale
					// defaultValue = 100, zoom = 2; = 65
					// defaultValue = 80, zoom = 2; = 50
					// defaultValue = 100, zoom = 1.5; = 86
					// defaultValue = 80, zoom = 1.5; = 68
					var applyZoomCompression = function( defaultValue, zoom ) {
						return clamp( Math.round( defaultValue - ( (Math.log(zoom) / Math.log(defaultValue / zoom)) * (defaultValue * zoom) ) ), Math.round(defaultValue / zoom), defaultValue );
					}

					// set default quality slightly higher than sharp's default
					if ( ! args.quality ) {
						args.quality = applyZoomCompression( 82, zoom );
					}

					// allow override of compression quality
					if (args.webp) {
						image.webp({
							quality: Math.round( clamp( args.quality, 0, 100 ) ),
						});
					} else if (metadata.format === 'jpeg') {
						image.jpeg({
							quality: Math.round( clamp( args.quality, 0, 100 ) ),
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
			if ( args.crop_strategy === 'smart' && args.resize ) {
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
