import { Args, getS3File, resizeBuffer, Config } from './lib';

/**
 *
 * @param event
 * @param response
 */
const streamify_handler: StreamifyHandler = async ( event, response ) => {
	const region = process.env.S3_REGION!;
	const bucket = process.env.S3_BUCKET!;
	const config: Config = {
		region: region,
		bucket: bucket,
	};
	if ( process.env.S3_ENDPOINT ) {
		config.endpoint = process.env.S3_ENDPOINT;
	}

	if ( process.env.S3_FORCE_PATH_STYLE ) {
		config.forcePathStyle = true;
	}

	const key = decodeURIComponent( event.rawPath.substring( 1 ) ).replace( '/tachyon/', '/' );
	const args = ( event.queryStringParameters || {} ) as unknown as Args & {
		'X-Amz-Expires'?: string;
		key: string;
	};
	args.key = key;
	if ( typeof args.webp === 'undefined' ) {
		args.webp = !! ( event.headers && Object.keys( event.headers ).find( key => key.toLowerCase() === 'x-webp' ) );
	}

	let s3_response = await getS3File( config, key, args );
	if ( ! s3_response.Body ) {
		throw new Error( 'No body in file.' );
	}
	let buffer = Buffer.from( await s3_response.Body.transformToByteArray() );

	let { info, data } = await resizeBuffer( buffer, args );
	// If this is a signed URL, we need to calculate the max-age of the image.
	let maxAge = 31536000;
	if ( args['X-Amz-Expires'] ) {
		// Date format of X-Amz-Date is YYYYMMDDTHHMMSSZ, which is not parsable by Date.
		const dateString = args['X-Amz-Date']!.replace(
			/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
			'$1-$2-$3T$4:$5:$6Z'
		);
		const date = new Date( dateString );

		// Calculate when the signed URL will expire, as we'll set the max-age
		// cache control to this value.
		const expires = date.getTime() / 1000 + Number( args['X-Amz-Expires'] );

		// Mage age is the date the URL expires minus the current time.
		maxAge = Math.round( expires - new Date().getTime() / 1000 ); // eslint-disable-line no-unused-vars
	}

	response.setContentType( 'image/' + info.format );
	response.write( data );
	response.end();
};

if ( typeof awslambda === 'undefined' ) {
	global.awslambda = {
		/**
		 *
		 * @param handler
		 */
		streamifyResponse( handler: StreamifyHandler ): StreamifyHandler {
			return handler;
		},
	};
}

export const handler = awslambda.streamifyResponse( streamify_handler );
