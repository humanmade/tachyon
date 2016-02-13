var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	tachyon= require( './index' ),
	args = process.argv.slice(2),
	port   = args[0] || 8080;
	debug  = args.indexOf( '--debug' ) > -1;

console.log( process.argv )
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

	tachyon( 'hmn-uploads-eu-central', params.pathname.substr(1), params.query, function( err, data, info ) {
		if ( err ) {
			if ( debug ) {
				console.error( Date(), err )
			}
			response.writeHead( err.statusCode ? err.statusCode : 500, {} )
			response.write( err.message )
			return response.end()
		}
		response.writeHead( 200, {
			'Content-Type': 'image/' + info.format,
			'Content-Length': info.size
		})
		response.write( data )
		response.end()
	} );
}).listen( parseInt( port, 10 ) )

console.log("Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown");
