/**
 * Jest setup file to mock the AWS Lambda runtime global `awslambda`.
 * This must run before test modules are imported so that
 * lambda-handler.ts can call awslambda.streamifyResponse() at module scope.
 */
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
		from( stream: ResponseStream, metadata: any ): ResponseStream {
			stream.metadata = metadata;
			return stream;
		},
	},
};
