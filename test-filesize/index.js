const Table = require('cli-table');
const Filesize = require('filesize');
const tachyon = require('../index');
const fs = require('fs');
const images = fs.readdirSync('./images');

const table = new Table({
	head: ['Image', 'Original Size', 'Tachyon Size', '100px', '300px', '700px', '700px webp'],
	colWidths: [30, 15, 20, 15, 15, 15, 20],
});

async function test() {
	await Promise.all(images.map(async imageName => {
		const image = `${__dirname}/images/${imageName}`;
		const imageData = fs.readFileSync(image);
		const { info: originalInfo } = await tachyon.resizeBuffer(imageData, {});
		const { info: smallInfo } = await tachyon.resizeBuffer(imageData, {
			w: 100,
		});
		const { info: mediumInfo } = await tachyon.resizeBuffer(imageData, {
			w: 300,
		});
		const { info: largeInfo } = await tachyon.resizeBuffer(imageData, {
			w: 700,
		});
		const { info: webpInfo } = await tachyon.resizeBuffer(imageData, {
			w: 700,
			webp: true,
		});
		table.push([
			imageName,
			Filesize(imageData.length),
			Filesize(originalInfo.size) + ' (' + (Math.floor(originalInfo.size / imageData.length * 100)) + '%)',
			Filesize(smallInfo.size),
			Filesize(mediumInfo.size),
			Filesize(largeInfo.size),
			Filesize(webpInfo.size) + ' (' + (Math.floor(webpInfo.size / largeInfo.size * 100)) + '%)',
		]);
	}));

	console.log(table.toString());
}

test();
