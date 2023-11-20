declare var awslambda: {
	streamifyResponse: (
		handler: ( event: APIGatewayProxyEventV2, response: ResponseStream ) => Promise<any>
	) => ( event: APIGatewayProxyEventV2, context: ResponseStream ) => void;
};
