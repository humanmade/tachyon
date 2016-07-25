var sharp = require( 'sharp' ),
	AWS = require( 'aws-sdk' ),
	path = require( 'path' )

var regions = {}

module.exports = function( config, key, args, callback ) {
	AWS.config.region = config.region

	var s3config = {}
	if ( config.endpoint ) {
		s3config.endpoint = config.endpoint
		s3config.s3ForcePathStyle = true
	}

	if ( ! regions[ config.region ] ) {
		regions[ config.region ] = new AWS.S3(Object.assign({region: config.region }, s3config))
	}
	var s3 = regions[ config.region ]

	var file = s3.makeUnauthenticatedRequest( 'getObject', { Bucket: config.bucket, Key: key }, function( err, data ) {

		if ( err ) {
			return callback( err )
		}

		try {
			var image = sharp( data.Body ).withMetadata()

			// convert gifs to pngs
			if ( path.extname( key ).toLowerCase() === '.gif' ) {
				image.png()
			}

			// allow override of compression quality
			if ( args.quality ) {
				image.quality( Math.min( Math.max( Number( args.quality ), 0 ), 100 ) )
			}

			// resize & crop
			if ( args.resize ) {
				image.resize.apply( image, args.resize.split(',').map( function( v ) { return Number( v ) } ) )
			} else if ( args.fit ) {
				image.resize.apply( image, args.fit.split(',').map( function( v ) { return Number( v ) } ) )
				image.max()
			} else if ( args.w || args.h ) {
				image.resize( Number( args.w ), Number( args.h ) )

				if ( ! args.crop ) {
					image.max()
				}
			}

			// send image
			image.toBuffer( function( err, _data, info ) {
				if ( err ) {
					return callback( err )
				}

				info.originalSize = data.ContentLength

				return callback( err, _data, info )
			} )
		} catch( err ) {
			return callback( err )
		}
	} )
}
