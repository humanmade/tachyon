const Table = require('cli-table');
const Filesize = require('filesize');
const tachyon = require('../index');
const fs = require('fs');

let images = fs.readdirSync('./images');

const args = process.argv.slice(2);

if ( args[0] ) {
	images = images.filter( file => args[0] === file );
}

const table = new Table({
	head: [
		'Image',
		'Original Size',
		'Tachyon Size',
		'100px',
		'300px',
		'700px',
		'700px webp',
	],
	colWidths: [30, 15, 20, 15, 15, 15, 20],
});

async function test() {
	await Promise.all(
		images.map(async imageName => {
			const image = `${__dirname}/images/${imageName}`;
			const imageData = fs.readFileSync(image);
			const original = await tachyon.resizeBuffer(imageData, {});
			const sizes = {
				original: {},
				small: { w: 100 },
				medium: { w: 300 },
				large: { w: 700 },
				webp: { w: 700, webp: true },
			};
			const promises = await Promise.all(
				Object.entries(sizes).map(async ([size, args]) => {
					return tachyon.resizeBuffer(imageData, args);
				})
			);

			// Zip tehm back into a size => image map.
			const resized = promises.reduce((images, image, index) => {
				images[Object.keys(sizes)[index]] = image;
				return images;
			}, {});

			// Save each one to the file system for viewing.
			Object.entries(resized).forEach(([size, image]) => {
				fs.writeFile( `${__dirname}/output/${imageName}-${size}.${image.info.format}`, image.data, () => {});
			});

			table.push([
				imageName,
				Filesize(imageData.length),
				Filesize(resized.original.info.size) +
					' (' +
					Math.floor(resized.original.info.size / imageData.length * 100) +
					'%)',
				Filesize(resized.small.info.size),
				Filesize(resized.medium.info.size),
				Filesize(resized.large.info.size),
				Filesize(resized.webp.info.size) +
					' (' +
					Math.floor(resized.webp.info.size / resized.large.info.size * 100) +
					'%)',
			]);
		})
	);

	console.log(table.toString());
}

test();
