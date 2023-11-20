import { S3Client, S3ClientConfig, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';

export interface Args {
	// Required args.
	key: string;

	// Optional args.
	background?: string;
	crop?: string | string[];
	crop_strategy?: string;
	fit?: string;
	gravity?: string;
	h?: string;
	lb?: string;
	resize?: string | number[];
	quality?: string | number;
	w?: string;
	webp?: string | boolean;
	zoom?: string;
	'X-Amz-Algorithm'?: string;
	'X-Amz-Content-Sha256'?: string;
	'X-Amz-Credential'?: string;
	'X-Amz-SignedHeaders'?: string;
	'X-Amz-Expires'?: string;
	'X-Amz-Signature'?: string;
	'X-Amz-Date'?: string;
	'X-Amz-Security-Token'?: string;
}

export type Config = S3ClientConfig & { bucket: string };

/**
 * Get the dimensions from a string or array of strings.
 */
function getDimArray( dims: string | number[], zoom: number = 1 ): ( number | null )[] {
	let dimArr = typeof dims === 'string' ? dims.split( ',' ) : dims;
	return dimArr.map( v => Math.round( Number( v ) * zoom ) || null );
}

/**
 * Clamp a value between a min and max.
 */
function clamp( val: number | string, min: number, max: number ): number {
	return Math.min( Math.max( Number( val ), min ), max );
}

/**
 * Get a file from S3/
 */
export async function getS3File( config: Config, key: string, args: Args ): Promise<GetObjectCommandOutput> {
	const s3 = new S3Client( {
		...config,
		signer: {
			/**
			 *
			 * @param request
			 */
			sign: async request => {
				if ( ! args['X-Amz-Algorithm'] ) {
					return request;
				}
				const presignedParamNames = [
					'X-Amz-Algorithm',
					'X-Amz-Content-Sha256',
					'X-Amz-Credential',
					'X-Amz-SignedHeaders',
					'X-Amz-Expires',
					'X-Amz-Signature',
					'X-Amz-Date',
					'X-Amz-Security-Token',
				] as const;
				const presignedParams: { [K in ( typeof presignedParamNames )[number]]?: string } = {}; // eslint-disable-line no-unused-vars
				const signedHeaders = ( args['X-Amz-SignedHeaders']?.split( ';' ) || [] ).map( header => header.toLowerCase().trim() );

				for ( const paramName of presignedParamNames ) {
					if ( args[paramName] ) {
						presignedParams[paramName] = args[paramName];
					}
				}

				const headers: typeof request.headers = {};
				for ( const header in request.headers ) {
					if ( signedHeaders.includes( header.toLowerCase() ) ) {
						headers[header] = request.headers[header];
					}
				}
				request.query = presignedParams;

				request.headers = headers;
				return request;
			},
		},
	} );

	const command = new GetObjectCommand( {
		Bucket: config.bucket,
		Key: key,
	} );

	return s3.send( command );
}
/**
 * Apply a logarithmic compression to a value based on a zoom level.
 * return a default compression value based on a logarithmic scale
 * defaultValue = 100, zoom = 2; = 65
 * defaultValue = 80, zoom = 2; = 50
 * defaultValue = 100, zoom = 1.5; = 86
 * defaultValue = 80, zoom = 1.5; = 68
 */
function applyZoomCompression( defaultValue: number, zoom: number ): number {
	const value = Math.round( defaultValue - ( Math.log( zoom ) / Math.log( defaultValue / zoom ) ) * ( defaultValue * zoom ) );
	const min = Math.round( defaultValue / zoom );
	return clamp( value, min, defaultValue );
}

type ResizeBufferResult = {
	data: Buffer;
	info: sharp.OutputInfo & {
		errors: string;
	}
};

/**
 * Resize a buffer of an image.
 */
export async function resizeBuffer(
	buffer: Buffer | Uint8Array,
	args: Args
): Promise<ResizeBufferResult> {
	const image = sharp( buffer, {
		failOnError: false,
		animated: true,
	} ).withMetadata();

	// check we can get valid metadata
	const metadata = await image.metadata();

	// auto rotate based on orientation EXIF data.
	image.rotate();

	// validate args, remove from the object if not valid
	const errors: string[] = [];

	if ( args.w ) {
		if ( ! /^[1-9]\d*$/.test( args.w ) ) {
			delete args.w;
			errors.push( 'w arg is not valid' );
		}
	}
	if ( args.h ) {
		if ( ! /^[1-9]\d*$/.test( args.h ) ) {
			delete args.h;
			errors.push( 'h arg is not valid' );
		}
	}
	if ( args.quality ) {
		if (
			! /^[0-9]{1,3}$/.test( args.quality as string ) ||
			( args.quality as number ) < 0 ||
			( args.quality as number ) > 100
		) {
			delete args.quality;
			errors.push( 'quality arg is not valid' );
		}
	}
	if ( args.resize ) {
		if ( ! /^\d+(px)?,\d+(px)?$/.test( args.resize as string ) ) {
			delete args.resize;
			errors.push( 'resize arg is not valid' );
		}
	}
	if ( args.crop_strategy ) {
		if ( ! /^(smart|entropy|attention)$/.test( args.crop_strategy ) ) {
			delete args.crop_strategy;
			errors.push( 'crop_strategy arg is not valid' );
		}
	}
	if ( args.gravity ) {
		if ( ! /^(north|northeast|east|southeast|south|southwest|west|northwest|center)$/.test( args.gravity ) ) {
			delete args.gravity;
			errors.push( 'gravity arg is not valid' );
		}
	}
	if ( args.fit ) {
		if ( ! /^\d+(px)?,\d+(px)?$/.test( args.fit as string ) ) {
			delete args.fit;
			errors.push( 'fit arg is not valid' );
		}
	}
	if ( args.crop ) {
		if ( ! /^\d+(px)?,\d+(px)?,\d+(px)?,\d+(px)?$/.test( args.crop as string ) ) {
			delete args.crop;
			errors.push( 'crop arg is not valid' );
		}
	}
	if ( args.zoom ) {
		if ( ! /^\d+(\.\d+)?$/.test( args.zoom ) ) {
			delete args.zoom;
			errors.push( 'zoom arg is not valid' );
		}
	}
	if ( args.webp ) {
		if ( ! /^0|1|true|false$/.test( args.webp as string ) ) {
			delete args.webp;
			errors.push( 'webp arg is not valid' );
		}
	}
	if ( args.lb ) {
		if ( ! /^\d+(px)?,\d+(px)?$/.test( args.lb ) ) {
			delete args.lb;
			errors.push( 'lb arg is not valid' );
		}
	}
	if ( args.background ) {
		if ( ! /^#[a-f0-9]{3}[a-f0-9]{3}?$/.test( args.background ) ) {
			delete args.background;
			errors.push( 'background arg is not valid' );
		}
	}

	// crop (assumes crop data from original)
	if ( args.crop ) {
		const cropValuesString = typeof args.crop === 'string' ? args.crop.split( ',' ) : args.crop;

		// convert percentages to px values
		const cropValues = cropValuesString.map( function ( value, index ) {
			if ( value.indexOf( 'px' ) > -1 ) {
				return Number( value.substring( 0, value.length - 2 ) );
			} else {
				return Number(
					Number( ( metadata[index % 2 ? 'height' : 'width'] as number ) * ( Number( value ) / 100 ) ).toFixed( 0 )
				);
			}
		} );

		image.extract( {
			left: cropValues[0],
			top: cropValues[1],
			width: cropValues[2],
			height: cropValues[3],
		} );
	}

	// get zoom value
	const zoom = parseFloat( args.zoom || '1' ) || 1;

	// resize
	if ( args.resize ) {
		// apply smart crop if available
		if ( args.crop_strategy === 'smart' && ! args.crop ) {
			const cropResize = getDimArray( args.resize );
			const rotatedImage = await image.toBuffer();
			const result = await smartcrop.crop( rotatedImage, {
				width: cropResize[0] as number,
				height: cropResize[1] as number,
			} );

			if ( result && result.topCrop ) {
				image.extract( {
					left: result.topCrop.x,
					top: result.topCrop.y,
					width: result.topCrop.width,
					height: result.topCrop.height,
				} );
			}
		}

		// apply the resize
		args.resize = getDimArray( args.resize, zoom ) as number[];
		image.resize( {
			width: args.resize[0],
			height: args.resize[1],
			withoutEnlargement: true,
			position: ( args.crop_strategy !== 'smart' && args.crop_strategy ) || args.gravity || 'centre',
		} );
	} else if ( args.fit ) {
		const fit = getDimArray( args.fit, zoom ) as number[];
		image.resize( {
			width: fit[0],
			height: fit[1],
			fit: 'inside',
			withoutEnlargement: true,
		} );
	} else if ( args.lb ) {
		const lb = getDimArray( args.lb, zoom ) as number[];
		image.resize( {
			width: lb[0],
			height: lb[1],
			fit: 'contain',
			// default to a black background to replicate Photon API behavior
			// when no background colour specified
			background: args.background || 'black',
			withoutEnlargement: true,
		} );
	} else if ( args.w || args.h ) {
		image.resize( {
			width: Number( args.w ) * zoom || undefined,
			height: Number( args.h ) * zoom || undefined,
			fit: args.crop ? 'cover' : 'inside',
			withoutEnlargement: true,
		} );
	}

	// set default quality slightly higher than sharp's default
	if ( ! args.quality ) {
		args.quality = applyZoomCompression( 82, zoom );
	}

	// allow override of compression quality
	if ( args.webp ) {
		image.webp( {
			quality: Math.round( clamp( args.quality, 0, 100 ) ),
		} );
	} else if ( metadata.format === 'jpeg' ) {
		image.jpeg( {
			quality: Math.round( clamp( args.quality, 0, 100 ) ),
		} );
	} else if ( metadata.format === 'png' ) {
		// Compress the PNG.
		image.png( {
			palette: true,
		} );
	}

	// send image
	return new Promise( ( resolve, reject ) => {
		image.toBuffer( async ( err, data, info ) => {
			if ( err ) {
				reject( err );
			}

			// add invalid args
			resolve( {
				data,
				info: {
					...info,
					errors: errors.join( ';' ),
				},
			} );
		} );
	} );
}
