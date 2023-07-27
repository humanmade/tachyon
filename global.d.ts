declare var awslambda: {
	streamifyResponse: (
		handler: (event: any, response: any) => Promise<any>
	) => (event: any, context: any, callback: any) => void;
};
