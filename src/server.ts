import { createServer, IncomingMessage, ServerResponse } from 'http';
import { handler } from './lambda-handler.js';

// Define the server
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
	// Constructing API Gateway event
	const url = new URL(req.url!, `http://${req.headers.host}`);
	const apiGatewayEvent = {
		version: '2.0',
		routeKey: req.url!,
		rawPath: url.pathname,
		rawQueryString: url.searchParams.toString(),
		headers: req.headers,
		requestContext: {
			accountId: '123456789012', // replace with your AWS account ID
			stage: 'default',
			http: {
				method: req.method!,
				path: req.url!,
				protocol: 'HTTP/1.1',
				sourceIp: req.socket.remoteAddress!,
				userAgent: req.headers['user-agent']!,
			},
			requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef', // you should generate this dynamically
			routeKey: req.url!,
		},
		queryStringParameters: Array.from(url.searchParams).reduce(
			(acc, [key, value]) => ({ ...acc, [key]: value }),
			{}
		),
	};

	try {
		await handler(apiGatewayEvent, {
			setContentType(type: string): void {
				res.setHeader('Content-Type', type);
			},
			write(stream: string | Buffer): void {
				res.write(stream);
			},
			end(): void {
				res.end();
			},
		});
	} catch (e) {
		console.error(e);
		res.write(JSON.stringify(e));
		res.statusCode = 500;
		res.end();
	}
});

// Start the server
const port = 3000;
server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
