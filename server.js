var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	tachyon= require( './index' )
	port   = process.argv[2] || 8080;

http.createServer( function( request, response ) {
	var params = url.parse( request.url, true )

	tachyon( 'hmn-uploads-eu-central', params.pathname.substr(1), params.query, function( err, data, info ) {
		if ( err ) {
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
