var http = require("http"),
	url = require("url"),
	fs = require("fs"),
	os = require("os"),
	tachyon = require( './index' ),
	proxyFile = require( './proxy-file' ),
	args = process.argv.slice(2),
	port = Number( args[0] ) ? args[0] : 8080,
	debug = args.indexOf( '--debug' ) > -1;

var config = {};
if ( process.env.AWS_REGION && process.env.AWS_S3_BUCKET ) {
	config = {
		region: process.env.AWS_REGION,
		bucket: process.env.AWS_S3_BUCKET,
		endpoint: process.env.AWS_S3_ENDPOINT,
	};
} else if ( fs.existsSync( 'config.json' ) ) {
	config = JSON.parse( fs.readFileSync( 'config.json' ) );
}

http.createServer( function( request, response ) {
	var params = url.parse( request.url, true );

	if ( debug ) {
		console.log( Date(), request.url );
	}

	// healthcheck file
	if ( params.pathname === '/healthcheck.php' ) {
		response.writeHead( 200 );
		response.write( 'All good.' );
		return response.end();
	}

	// robots.txt
	if ( params.pathname === '/robots.txt' ) {
		response.writeHead( 200, {
			'Content-Type': 'text/plain',
		} );
		response.write( 'User-agent: *' + os.EOL + 'Allow: /' );
		return response.end();
	}

	const key = decodeURIComponent( params.pathname.substr(1) ).replace( '/uploads/tachyon/', '/uploads/' );
	const args = params.query || {};
	if ( typeof args.webp === 'undefined' ) {
		args.webp = !!( request.headers && request.headers['accept'] && request.headers['accept'].match( 'image/webp' ) );
	}

	return tachyon.s3( config, key, args, function( err, data, info ) {
		if ( err ) {
			function callback( error, rsp ) {
				if ( error ) {
					if ( debug ) {
						console.error( Date(), error );
					}
					response.writeHead( error.statusCode ? error.statusCode : 500, {
						'Cache-Control': 'no-cache',
					} );
					response.write( error.message );
					return response.end();
				}
				response.writeHead( rsp.statusCode, Object.assign( {
					'Content-Type': 'image/gif',
					'Cache-Control': 'public, max-age=31557600',
				} ) );
				response.write( Buffer.from( rsp.body, 'base64' ) );
				return response.end();
			}
			if ( err.message === 'fallback-to-original' ) {
				const s3config = { region: config.region };
				if ( config.endpoint ) {
					s3config.endpoint = config.endpoint;
				}
				return proxyFile( s3config, config.bucket, key, callback );
			}
			return callback( err );
		}
		response.writeHead( 200, {
			'Content-Type': 'image/' + info.format,
			'Content-Length': info.size,
			'Cache-Control': 'public, max-age=31557600',
		} );
		response.write( data );
		return response.end();
	} );
} ).listen( parseInt( port, 10 ) );

console.log( "Server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown" );
