import { test, expect } from '@jest/globals';

import { handler } from '../src/lambda-handler';

test( 'Test get private upload', async () => {
	process.env.S3_BUCKET = 'hmn-uploads';
	process.env.S3_REGION = 'us-east-1';

	// The below credentials are temporary and will need regenerating before the test is run.
	// Run aws s3 presign --expires 3600 s3://hmn-uploads/s3-uploads-unit-tests/private.png
	const event = {
		'version': '2.0',
		'routeKey': '$default',
		'rawPath': '/s3-uploads-unit-tests/private.png',
		'headers': {
		},
		'queryStringParameters': {
			'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
			'X-Amz-Credential': 'AKIAYM4GX6NWUGJQMRZ4/20240227/us-east-1/s3/aws4_request',
			'X-Amz-Date': '20240227T142125Z',
			'X-Amz-Expires': '3600',
			'X-Amz-SignedHeaders': 'host',
			'X-Amz-Signature': '1eb6c4654f06256080544688a3124e4933050a070aced3db0e1830285726956c',
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
			console.log( stream );
		},
		/**
		 * End the response.
		 */
		end(): void {
			console.log( 'end' );
		},
	} );

	expect( contentType ).toBe( 'image/png' );
} );

test( 'Test get private upload with presign params', async () => {
	process.env.S3_BUCKET = 'hmn-uploads';
	process.env.S3_REGION = 'us-east-1';

	// The below credentials are temporary and will need regenerating before the test is run.
	// Run aws s3 presign --expires 3600 s3://hmn-uploads/s3-uploads-unit-tests/private.png
	const event = {
		'version': '2.0',
		'routeKey': '$default',
		'rawPath': '/s3-uploads-unit-tests/private.png',
		'headers': {
		},
		'queryStringParameters': {
			presign: 'X-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAYM4GX6NWUGJQMRZ4%252F20240228%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20240228T084322Z%26X-Amz-Expires%3D3600%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Signature%3D829aa1a8b6b3e93ce666e1ddababcbbc8c6e6b4ac0a979da2fae4e360026c856',
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
