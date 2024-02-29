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

// Currently the handler will throw an error if the file is not found, rather than correctly
// return a status code and message.
test.failing( 'Test image not found', async () => {
	const testResponseStream = new TestResponseStream();
	animatedGifLambdaEvent.rawPath = '/tachyon/does-not-exist.gif';

	await handler( animatedGifLambdaEvent, testResponseStream );

	expect( testResponseStream.contentType ).toBe( 'image/gif' );
} );

/**
 * A test response stream.
 */
class TestResponseStream {
	contentType: string | undefined;
	body: string | Buffer | undefined;
	headers: { [key: string]: string } = {};

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
		from( stream: ResponseStream, metadata ) : ResponseStream {
			return stream;
		},
	},
};
