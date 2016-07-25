var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	fs     = require("fs"),
	tachyon= require( './index' ),
	args = process.argv.slice(2),
	port   = Number( args[0] ) ? args[0] : 8080,
	debug  = args.indexOf( '--debug' ) > -1

var config = JSON.parse( fs.readFileSync( 'config.json' ) )

http.createServer( function( request, response ) {
	var params = url.parse( request.url, true )

	if ( debug ) {
		console.log( Date(), request.url )
	}

	try {
		var imageData = fs.readFileSync( decodeURI( params.pathname.substr(1) ) )
	} catch ( err ) {
		response.writeHead( err.statusCode ? err.statusCode : 500 )
		response.write( err.message )
		return response.end()
	}

	return tachyon.resizeBuffer( imageData, params.query, function( err, data, info ) {

		if ( err ) {
			if ( debug ) {
				console.error( Date(), err )
			}
			response.writeHead( err.statusCode ? err.statusCode : 500 )
			response.write( err.message )
			return response.end()
		}
		response.writeHead( 200, {
			'Content-Type': 'image/' + info.format,
			'Content-Length': info.size
		})
		response.write( data )
		return response.end()
	} );
}).listen( parseInt( port, 10 ) )

console.log( "Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown" )
