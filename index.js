var sharp = require( 'sharp' ),
	AWS = require( 'aws-sdk' ),
	path = require( 'path' )

var regions = {}

module.exports = {}

module.exports.s3 = function( region, bucket, key, args, callback ) {
	AWS.config.region = region
	if ( ! regions[ region ] ) {
		regions[ region ] = new AWS.S3({region: region})
	}
	var s3 = regions[ region ]

	var file = s3.makeUnauthenticatedRequest( 'getObject', { Bucket: bucket, Key: key }, function( err, data ) {

		if ( err ) {
			return callback( err )
		}

		args.key = key

		module.exports.resizeBuffer( data.Body, args, callback )
	} )
}

module.exports.resizeBuffer = function( buffer, args, callback ) {
	try {
		var image = sharp( buffer ).withMetadata()

		image.metadata( function( err, metadata ) {
			if ( err ) {
				return callback( err )
			}

			// convert gifs to pngs
			if( path.extname( args.key ).toLowerCase() === '.gif' ) {
				image.png()
			}

			// allow override of compression quality
			if ( args.quality ) {
				image.quality( Math.min( Math.max( Number( args.quality ), 0 ), 100 ) )
			}

			// crop (assumes crop data from original)
			if ( args.crop ) {
				var cropValues = typeof args.crop === 'string' ? args.crop.split( ',' ) : args.crop

				// convert percantages to px values
				cropValues = cropValues.map( function( value, index ) {
					if ( value.indexOf( 'px' ) > -1 ) {
						return Number( value.substr( 0, value.length - 2 ) )
					} else {
						return Number( Number( metadata[ index % 2 ? 'height' : 'width' ] * ( value / 100 ) ).toFixed(0) )
					}
				})

				image.extract( {
					left: cropValues[0],
					top: cropValues[1],
					width: cropValues[2],
					height: cropValues[3]
				} )
			}

			// resize
			if ( args.resize ) {
				image.resize.apply( image, args.resize.split(',').map( function( v ) { return Number( v ) } ) )
			} else if ( args.fit ) {
				image.resize.apply( image, args.fit.split(',').map( function( v ) { return Number( v ) } ) )
				image.max()
			} else if ( args.w || args.h ) {
				image.resize( args.w ? Number( args.w ) : null, args.h ? Number( args.h ) : null )
				if ( ! args.crop ) {
					image.max()
				}
			}

			// send image
			image.toBuffer( function( err, _data, info ) {
				if ( err ) {
					return callback( err )
				}

				return callback( err, _data, info )
			} )
		})

	} catch ( err ) {
		return callback( err )
	}
}
