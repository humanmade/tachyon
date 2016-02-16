var sharp = require( 'sharp' ),
	AWS = require( 'aws-sdk' )

AWS.config.region = 'eu-central-1'
var s3 = new AWS.S3();

module.exports = function( bucket, key, args, callback ) {
	var file = s3.makeUnauthenticatedRequest( 'getObject', { Bucket: bucket, Key: key }, function( err, data ) {

		if ( err ) {
			return callback( err )
		}

		try {
			var image = sharp( data.Body ).withMetadata()

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

			image.toBuffer( function( err, _data, info ) {
				if ( err ) {
					return callback( err )
				}

				info.originalSize = data.ContentLength

				callback( err, _data, info )
			} )
		} catch( err ) {
			callback( err )
		}
	} )
}
