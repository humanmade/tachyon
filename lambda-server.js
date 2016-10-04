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
		lambdaRegion: request.headers['lambda-region'] ? request.headers['lambda-region'] : request.headers['region'],
		bucket: request.headers.bucket
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
			bucket: config.bucket,
			key: decodeURI( params.pathname.substr(1) ),
			args: params.query,
			region: config.region
		} )
	}, function( err, data ) {

		// the call may have been a success, but it returned error data
		if ( data ) {
			data = JSON.parse( data.Payload )

			if ( data.errorMessage ) {
				err = {
					message: data.errorMessage,
					statusCode: data.errorType === 'NoSuchKey' ? 404 : 500
				}
			}
		}

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

		response.write( new Buffer( data.data, 'base64' ) )
		return response.end()
	})

}).listen( parseInt( port, 10 ) )

console.log( "Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown" )
