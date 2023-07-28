import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Args, getS3File, resizeBuffer } from './lib.js';

type ResponseStream = {
	setContentType(type: string): void;
	write(stream: string | Buffer): void;
	end(): void;
};

type StreamifyHandler = (event: APIGatewayProxyEventV2, response: ResponseStream) => Promise<any>;

const streamify_handler: StreamifyHandler = async (event, response) => {
	const region = process.env.S3_REGION;
	const bucket = process.env.S3_BUCKET;
	const key = decodeURIComponent(event.rawPath.substring(1)).replace('/tachyon/', '/');
	const args = (event.queryStringParameters || {}) as unknown as Args & {
		'X-Amz-Expires'?: string;
	};
	args.key = key;
	if (typeof args.webp === 'undefined') {
		args.webp = !!(event.headers && Object.keys(event.headers).find((key) => key.toLowerCase() == 'x-webp'));
	}

	let s3_response = await getS3File({ region: region, bucket: bucket as string }, key, args);
	if (!s3_response.Body) {
		throw new Error('No body in file.');
	}
	let buffer = Buffer.from(await s3_response.Body.transformToByteArray());

	let { info, data } = await resizeBuffer(buffer, args);
	// If this is a signed URL, we need to calculate the max-age of the image.
	let maxAge = 31536000;
	if (args['X-Amz-Expires']) {
		// Date format of X-Amz-Date is YYYYMMDDTHHMMSSZ, which is not parsable by Date.
		// @ts-ignore
		const dateString = args['X-Amz-Date'].replace(
			/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
			'$1-$2-$3T$4:$5:$6Z'
		);
		const date = new Date(dateString);

		// Calculate when the signed URL will expire, as we'll set the max-age
		// cache control to this value.
		const expires = date.getTime() / 1000 + Number(args['X-Amz-Expires']);

		// Mage age is the date the URL expires minus the current time.
		maxAge = Math.round(expires - new Date().getTime() / 1000);
	}
	response.setContentType('image/' + info.format);
	response.write(data);
	response.end();
};

export const handler = awslambda.streamifyResponse(streamify_handler);
