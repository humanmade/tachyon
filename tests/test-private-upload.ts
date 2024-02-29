import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { test, expect } from '@jest/globals';
import { MiddlewareType } from '@smithy/types';

import { handler } from '../src/lambda-handler';
import { Args } from '../src/lib';

/**
 * Presign a URL for a given key.
 * @param key
 * @returns {Promise<Args>} The presigned params
 */
async function getPresignedUrlParams( key: string ) : Promise<Args> {
	const client = new S3Client( {
		region: process.env.S3_REGION,
	} );
	const command = new GetObjectCommand( {
		Bucket: process.env.S3_BUCKET,
		Key: key,
	} );

	/**
	 * Middleware to remove the x-id query string param form the GetObject call.
	 */
	const middleware: MiddlewareType<any, any> = ( next: any, context: any ) => async ( args: any ) => {
		const { request } = args;
		delete request.query['x-id'];
		return next( args );
	};

	client.middlewareStack.addRelativeTo( middleware, {
		name: 'tests',
		relation: 'before',
		toMiddleware: 'awsAuthMiddleware',
		override: true,
	} );

	const presignedUrl = new URL( await getSignedUrl( client, command, {
		expiresIn: 60,
	} ) );

	const queryStringParameters: Args = Object.fromEntries( presignedUrl.searchParams.entries() );

	return queryStringParameters;
}

test( 'Test get private upload', async () => {
	const event = {
		'version': '2.0',
		'routeKey': '$default',
		'rawPath': '/private.png',
		'headers': {
		},
		queryStringParameters: await getPresignedUrlParams( 'private.png' ),
		'isBase64Encoded': false,
	};

	let contentType;

	await handler( event, {
		/**
		 * Set the content type for the respone.
		 */
		setContentType( type: string ): void {
			contentType = type;
		},
		/**
		 * Write data to the response.
		 */
		write( stream: string | Buffer ): void {
		},
		/**
		 * End the response.
		 */
		end(): void {
		},
	} );

	expect( contentType ).toBe( 'image/png' );
} );

test( 'Test get private upload with presign params', async () => {
	const presignParams = await getPresignedUrlParams( 'private.png' ) as Record<string, string>;

	// The below credentials are temporary and will need regenerating before the test is run.
	// Run aws s3 presign --expires 3600 s3://hmn-uploads/private.png
	const event = {
		'version': '2.0',
		'routeKey': '$default',
		'rawPath': '/private.png',
		'headers': {
		},
		'queryStringParameters': {
			presign: encodeURIComponent( new URLSearchParams( presignParams ).toString() ),
		},
		'isBase64Encoded': false,
	};

	let contentType;

	await handler( event, {
		/**
		 * Set the content type for the respone.
		 */
		setContentType( type: string ): void {
			contentType = type;
		},
		/**
		 * Write data to the response.
		 */
		write( stream: string | Buffer ): void {
		},
		/**
		 * End the response.
		 */
		end(): void {
		},
	} );

	expect( contentType ).toBe( 'image/png' );
} );
