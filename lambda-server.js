var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	fs     = require("fs"),
	tachyon= require( './index' ),
	args = process.argv.slice(2),
	port   = Number( args[0] ) ? args[0] : 8080,
	debug  = args.indexOf( '--debug' ) > -1,
	aws = require('aws-sdk')

http.createServer( function( request, response ) {

	var config = {
		region: request.headers.region,
		lambdaFunction : request.headers['lambda-function'],
		lambdaRegion: request.headers['lambda-region'] ? request.headers['lambda-region'] : request.headers['region']
	}

	var lambda = new aws.Lambda({ region: config.lambdaRegion })
	var params = url.parse( request.url, true )
	var key = decodeURI( params.pathname.substr(1) )

	if ( debug ) {
		console.log( Date(), request.url )
	}

	// healthcheck file
	if ( params.pathname === '/healthcheck.php' ) {
		response.writeHead( 200 )
		response.write( 'All good.' )
		return response.end()
	} else if ( params.pathname === '/favicon.ico' ) {
		response.writeHead( 404 )
		return response.end()
	}

	return lambda.invoke({
		FunctionName: config.lambdaFunction,
		Payload: JSON.stringify( {
			key: key,
			args: params.query
		} )
	}, function( err, data ) {

		// the call may have been a success, but it returned error data
		if ( err ) {
			return sendResponse( err, data )
		}

		data = JSON.parse( data.Payload )

		if ( data.errorMessage ) {
			// if the response from Lambda is an error which says "fallback-to-original"
			// we can stream the file from S3 directly to the client.
			if ( data.errorMessage === 'fallback-to-original' ) {
				var s3= new aws.S3( { region: config.region } )
				s3.makeUnauthenticatedRequest( 'getObject', { Bucket: config.bucket, Key: key }, function( err, data ) {
					if ( err ) {
						return sendResponse( err )
					}
					return sendResponse( null, {
						format: data.ContentType.replace( /^image\//, '' ),
						size: data.ContentLength,
						buffer: data.Body,
					} )
				} )
			} else {
				return sendResponse( {
					message: 'Error returned by lambda function: ' + data.errorMessage + ' (' + data.errorType + ')',
					statusCode: data.errorType === 'NoSuchKey' ? 404 : 500
				} )
			}
		} else {
			data.buffer = new Buffer( data.data, 'base64' )
			delete data.data
			sendResponse( err, data )
		}
	})

	function sendResponse( err, data ) {
		if ( err ) {
			if ( debug ) {
				console.error( Date(), err )
			}
			response.writeHead( err.statusCode ? err.statusCode : 500, {
				'Cache-Control': 'no-cache'
			} )
			response.write( err.message )
			return response.end()
		}
		response.writeHead( 200, {
			'Content-Type': 'image/' + data.format,
			'Content-Length': data.size,
			'Cache-Control': 'public, max-age=31557600'
		})

		response.write( data.buffer )
		return response.end()
	}

}).listen( parseInt( port, 10 ) )

console.log( "Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown" )
