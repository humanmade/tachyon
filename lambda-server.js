var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	tachyon= require( './index' ),
	args = process.argv.slice(2),
	port   = Number( args[0] ) ? args[0] : 8080,
	debug  = args.indexOf( '--debug' ) > -1,
	aws = require('aws-sdk')

var lambda = new aws.Lambda({
	region: 'eu-west-1'
});

http.createServer( function( request, response ) {
	var params = url.parse( request.url, true )

	if ( debug ) {
		console.log( Date(), request.url )
	}

	// healthcheck file
	if ( params.pathname === '/healthcheck.php' ) {
		response.writeHead( 200 )
		response.write( 'All good.' )
		return response.end()
	}

	lambda.invoke({
		FunctionName: 'node-tachyon',
		Payload: JSON.stringify( {
			bucket: 'hmn-uploads-eu',
			key: decodeURI( params.pathname.substr(1) ),
			args: params.query,
			region: 'eu-west-1'
		} )
	}, function( err, data ) {

		data = JSON.parse( data.Payload )
		if ( data.errorMessage ) {
			err = {
				message: data.errorMessage
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
		response.end()
	});

}).listen( parseInt( port, 10 ) )

console.log("Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown");
