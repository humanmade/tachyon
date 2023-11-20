import fs from 'fs';

import { test, expect } from '@jest/globals';
import sharp from 'sharp';

import { resizeBuffer } from '../src/lib';

test.failing( 'Test animated png resize', async () => {
	let file = fs.readFileSync( __dirname + '/images/animated.png', {} );
	const result = await resizeBuffer( file, { w: '20' } );
	expect( result.info.format ).toBe( 'png' );
	expect( result.info.width ).toBe( 20 );

	let image = sharp( file );
	let metadata = await image.metadata();
	expect( metadata.pages ).toBe( 20 );
} );

test( 'Test animated gif resize', async () => {
	let file = fs.readFileSync( __dirname + '/images/animated.gif', {} );
	const result = await resizeBuffer( file, { w: '20' } );
	expect( result.info.format ).toBe( 'gif' );
	expect( result.info.width ).toBe( 20 );

	let image = sharp( file );
	let metadata = await image.metadata();
	expect( metadata.pages ).toBe( 48 );
} );

test( 'Test animated gif resize webp', async () => {
	let file = fs.readFileSync( __dirname + '/images/animated.gif', {} );
	const result = await resizeBuffer( file, {
		w: '20',
		webp: true,
	} );
	expect( result.info.format ).toBe( 'webp' );
	expect( result.info.width ).toBe( 20 );

	let image = sharp( file );
	let metadata = await image.metadata();
	expect( metadata.pages ).toBe( 48 );
} );

test( 'Test animated webp resize', async () => {
	let file = fs.readFileSync( __dirname + '/images/animated.webp', {} );
	const result = await resizeBuffer( file, {
		w: '20',
	} );
	expect( result.info.format ).toBe( 'webp' );
	expect( result.info.width ).toBe( 20 );

	let image = sharp( file );
	let metadata = await image.metadata();
	expect( metadata.pages ).toBe( 12 );
} );

test( 'Test animated webp resize webp', async () => {
	let file = fs.readFileSync( __dirname + '/images/animated.webp', {} );
	const result = await resizeBuffer( file, {
		w: '20',
		webp: true,
	} );
	expect( result.info.format ).toBe( 'webp' );
	expect( result.info.width ).toBe( 20 );

	let image = sharp( file );
	let metadata = await image.metadata();
	expect( metadata.pages ).toBe( 12 );
} );
