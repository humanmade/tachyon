<table width="100%">
	<tr>
		<td align="left" colspan="2">
			<strong>Tachyon</strong><br />
			Faster than light image resizing service that runs on AWS. Super simple to set up, highly available and very performant.
		</td>
	</tr>
	<tr>
		<td>
			A <strong><a href="https://hmn.md/">Human Made</a></strong> project. Maintained by @joehoyle.
		</td>
		<td align="center">
			<img src="https://hmn.md/content/themes/hmnmd/assets/images/hm-logo.svg" width="100" />
		</td>
	</tr>
</table>

Tachyon is a faster than light image resizing service that runs on AWS. Super simple to set up, highly available and very performant.


## Setup

Tachyon comes in two parts: the server to serve images and the [plugin to use it](./docs/plugin.md). To use Tachyon, you need to run at least one server, as well as the plugin on all sites you want to use it.

## Installation on AWS Lambda

We require using Tachyon on [AWS Lambda](https://aws.amazon.com/lambda/details/) to offload image processing task in a serverless configuration. This ensures you don't need lots of hardware to handle thousands of image resize requests, and can scale essentially infinitely. One Tachyon stack is required per S3 bucket, so we recommend using a common region bucket for all sites, which then only requires a single Tachyon stack per region.

Tachyon requires the following Lambda Function spec:

- Runtime: Node JS 18
- Function URL activated
- Env vars:
  - S3_BUCKET=my-bucket
  - S3_REGION=my-bucket-region
  - S3_ENDPOINT=http://my-custom-endpoint (optional)
  - S3_FORCE_PATH_STYLE=1 (optional)

Take the `lambda.zip` from the latest release and upload it to your function.

## Documentation

* [Plugin Setup](./docs/plugin.md)
* [Using Tachyon](./docs/using.md)
* [Hints and Tips](./docs/tips.md)


## Credits

Created by Human Made for high volume and large-scale sites. We run Tachyon on sites with millions of monthly page views, and thousands of sites.

Written and maintained by [Joe Hoyle](https://github.com/joehoyle).

Tachyon is inspired by Photon by Automattic. As Tachyon is not an all-purpose image resizer, rather it uses a media library in Amazon S3, it has a different use case to [Photon](https://jetpack.com/support/photon/).

Tachyon uses the [Sharp](https://github.com/lovell/sharp) (Used under the license Apache License 2.0) Node.js library for the resizing operations, which in turn uses the great libvips library.

Interested in joining in on the fun? [Join us, and become human!](https://hmn.md/is/hiring/)


## Looking for a different Tachyon?

Tachyon by Human Made provides image resizing services for the web, and is specifically designed for WordPress. "Tachyon" is named after the [hypothetical faster-than-light particle](https://en.wikipedia.org/wiki/Tachyon).

Other software named Tachyon include:

* [Tachyon by VYV](https://tachyon.video/) - Video playback and media server.
* [Tachyon by Cinnafilm](https://cinnafilm.com/product/tachyon/) - Video processing for the cinema industry.
* [TACHYONS](https://tachyons.io/) - CSS framework.
