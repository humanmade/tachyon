const http = require('http');
const url = require('url');
const querystring = require('querystring');
const {
	spawn
} = require('child_process');


http.createServer(function (request, response) {
	const bucket = 'hmn-uploads-eu';
	const region = 'eu-west-1';
	const task = __dirname;

	const pathName = url.parse(request.url).pathname;
	const query = url.parse(request.url).query;
	const args = {
		path: pathName,
		queryStringParameters: querystring.parse( query ),
		headers: request.headers,
	};
	const childArgs = ['run', '--rm', '-e', `S3_BUCKET=${ bucket }`, '-e', `S3_REGION=${ region }`, '-v', `${ task }:/var/task`, 'lambci/lambda:nodejs6.10', 'lambda-handler.handler', JSON.stringify(args)];
	const child = spawn('docker', childArgs);
	var stdout = '';
	child.stdout.on('data', data => stdout += data);
	child.stderr.on('data', data => console.warn(String(data)));
	child.on('close', function () {
		const lambdaExec = JSON.parse(stdout);
		if ( lambdaExec.errorMessage ) {
			response.writeHead( 500 );
			response.write(JSON.stringify( lambdaExec ) );
			response.end();
			return;
		}
		response.writeHead(lambdaExec.statusCode, lambdaExec.headers);
		response.write(Buffer.from(lambdaExec.body, 'base64'));
		response.end();
	});
}).listen(7000);
