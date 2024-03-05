declare type ResponseStream = {
	setContentType( type: string ): void;
	write( stream: string | Buffer ): void;
	end(): void;
};

declare type StreamifyHandler = ( event: APIGatewayProxyEventV2, response: ResponseStream ) => Promise<any>;

declare var awslambda: {
	streamifyResponse: (
		handler: StreamifyHandler
	) => ( event: APIGatewayProxyEventV2, context: ResponseStream ) => void,
	HttpResponseStream: {
		from( response: ResponseStream, metadata: {
			headers?: Record<string, string>,
			statusCode: number,
			cookies?: string[],
		} ): ResponseStream
	}
};

