import { test, expect } from '@jest/globals';

import { handler } from '../src/lambda-handler';

import animatedGifLambdaEvent from './events/animated-gif.json';

process.env.S3_REGION = 'us-east-1';
process.env.S3_BUCKET = 'hmn-uploads';

test( 'Test content type headers', async () => {
	const testResponseStream = new TestResponseStream();
	await handler( animatedGifLambdaEvent, testResponseStream );

	expect( testResponseStream.contentType ).toBe( 'image/gif' );
} );

test( 'Test image not found', async () => {
	const testResponseStream = new TestResponseStream();
	animatedGifLambdaEvent.rawPath = '/tachyon/does-not-exist.gif';

	await handler( animatedGifLambdaEvent, testResponseStream );

	expect( testResponseStream.metadata.statusCode ).toBe( 404 );
} );

/**
 * A test response stream.
 */
class TestResponseStream {
	contentType: string | undefined;
	body: string | Buffer | undefined;
	headers: { [key: string]: string } = {};
	metadata: any;

	setContentType( type: string ): void {
		this.contentType = type;
	}
	write( stream: string | Buffer ): void {
		if ( typeof this.body === 'string' ) {
			this.body += stream;
		} else if ( this.body instanceof Buffer ) {
			this.body = this.body.toString().concat( stream.toString() );
		} else {
			this.body = stream;
		}
	}
	end(): void {
		if ( this.metadata.headers['Content-Type'] ) {
			this.contentType = this.metadata.headers['Content-Type'];
		}
	}
}

global.awslambda = {
	/**
	 *
	 * @param handler
	 */
	streamifyResponse( handler: StreamifyHandler ): StreamifyHandler {
		return handler;
	},
	HttpResponseStream: {
		/**
		 * @param stream The response stream.
		 * @param metadata The metadata for the response.
		 */
		from( stream: TestResponseStream, metadata ) : TestResponseStream {
			stream.metadata = metadata;
			return stream;
		},
	},
};
