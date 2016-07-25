var http   = require("http"),
	url    = require("url"),
	path   = require("path"),
	fs     = require("fs"),
	tachyon= require( './index' ),
	args = process.argv.slice(2),
	port   = Number( args[0] ) ? args[0] : 8080,
	debug  = args.indexOf( '--debug' ) > -1

var config = {}
if ( process.env.AWS_REGION && process.env.AWS_S3_BUCKET ) {
	config = {
		region: process.env.AWS_REGION,
		bucket: process.env.AWS_S3_BUCKET,
		endpoint: process.env.AWS_S3_ENDPOINT,
	}
} else if ( fs.existsSync( 'config.json' ) ) {
	config = JSON.parse( fs.readFileSync( 'config.json' ) )
}

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

	tachyon( config.region, config.bucket, decodeURI( params.pathname.substr(1) ), params.query, function( err, data, info ) {

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
			'Content-Type': 'image/' + info.format,
			'Content-Length': info.size,
			'Cache-Control': 'public, max-age=31557600'
		})
		response.write( data )
		response.end()
	} );
}).listen( parseInt( port, 10 ) )

console.log( "Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown" )
