declare var awslambda: {
	streamifyResponse: (
		handler: (event: any, response: any) => Promise<any>
	) => (event: any, context: any, callback: any) => void;
};

declare module "animated-gif-detector" {
	function isAnimated(buffer: Buffer): bool;
	export = isAnimated;
}
