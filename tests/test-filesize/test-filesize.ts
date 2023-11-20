import fs from 'fs';

import { test, expect } from '@jest/globals';
import Table from 'cli-table';
import { filesize } from 'filesize';

import { Args, resizeBuffer } from '../../src/lib';

let images = fs.readdirSync( __dirname + '/images' );

const args = process.argv.slice( 2 );

if ( args[0] && args[0].indexOf( '--' ) !== 0 ) {
	images = images.filter( file => args[0] === file );
}

const saveFixtured = false;

const table = new Table( {
	head: [ 'Image', 'Original Size', 'Tachyon Size', '100px', '300px', '700px', '700px webp' ],
	colWidths: [ 30, 15, 20, 15, 15, 15, 20 ],
} );

// Read in existing features for resizes, so we can detect if image resizing
// has lead to a change in file size from previous runs.
const oldFixtures = JSON.parse( fs.readFileSync( __dirname + '/fixtures.json' ).toString() );
const fixtures: { [key: string]: number } = {};

/**
 *
 */
test( 'Test file sizes', async () => {
	await Promise.all(
		images.map( async imageName => {
			const image = `${__dirname}/images/${imageName}`;
			const imageData = fs.readFileSync( image );
			const sizes = {
				original: {},
				small: { w: 100 },
				medium: { w: 300 },
				large: { w: 700 },
				webp: {
					w: 700,
					webp: true,
				},
			};
			const promises = await Promise.all(
				Object.entries( sizes ).map( async ( [ _size, args ] ) => {
					return resizeBuffer( imageData, args as Args );
				} )
			);

			// Zip them back into a size => image map.
			const initial : { [key: string]: any } = {};
			const resized = promises.reduce( ( images, image, index ) => {
				images[ Object.keys( sizes )[index] ] = image;
				return images;
			}, initial );

			// Save each one to the file system for viewing.
			Object.entries( resized ).forEach( ( [ size, image ] ) => {
				const imageKey = `${imageName}-${size}.${image.info.format}`;
				fixtures[imageKey] = image.data.length;
				fs.writeFile( `${__dirname}/output/${imageKey}`, image.data, () => {} );
			} );

			table.push( [
				imageName,
				filesize( imageData.length ),
				filesize( resized.original.info.size ) +
					' (' +
					Math.floor( ( resized.original.info.size / imageData.length ) * 100 ) +
					'%)',
				filesize( resized.small.info.size ),
				filesize( resized.medium.info.size ),
				filesize( resized.large.info.size ),
				filesize( resized.webp.info.size ) +
					' (' +
					Math.floor( ( resized.webp.info.size / resized.large.info.size ) * 100 ) +
					'%)',
			] );
		} )
	);

	if ( saveFixtured ) {
		fs.writeFileSync( __dirname + '/fixtures.json', JSON.stringify( fixtures, null, 4 ) );
	}

	console.log( table.toString() );

	for ( const key in fixtures ) {
		expect( fixtures[key] ).toBeLessThanOrEqual( oldFixtures[key] );

		if ( fixtures[key] < oldFixtures[key] ) {
			const diff = ( fixtures[key] / oldFixtures[key] ) * 100;
			console.log(
				`${key} is smaller than image in fixtures by (${
					filesize( oldFixtures[key] - fixtures[key] )
				}, ${diff}%.). New ${ filesize( fixtures[key] ) }, old ${ filesize( oldFixtures[key] ) } }`
			);
		}
	}
} );
