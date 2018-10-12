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


Tachyon is built with some strong opinions and assumptions:

- Runs on AWS (using CloudFront, Lambda and API Gateway.)
- Expects original image files to be stored on Amazon S3.
- Only supports simple image resizing, not a full image manipulation service.

Tachyon works best with WordPress, coupled with [S3 Uploads](https://github.com/humanmade/s3-uploads) and the [Tachyon Plugin](https://github.com/humanmade/tachyon-plugin).

**[View Documentation →](docs/README.md)**

![](docs/diagram.png)

---

## Documentation

**[View Documentation →](docs/README.md)**

### Setup

Tachyon comes in two parts: the [server to serve images](docs/server.md), and the [plugin to use it](docs/plugin.md). To use Tachyon, you need to run at least one server, as well as the plugin on all sites you want to use it.

The server is also available as a [Docker image](docs/docker.md), which can be used in production or to set up a local test environment.

## Using

Tachyon provides a simple HTTP interface in the form of:

`https://{tachyon-domain}/my/image/path/on/s3.png?w=100&h=80`

It's really that simple!

**[View Args Reference →](docs/using.md)**

## Release Process

1. Create and push a new tag following the convention `vx.x.x`
1. Build a new ZIP file by running `npm run build-docker && npm run build-node-modules && build-zip`
1. Publish a new GitHub release, uploading `lambda.zip` as the built artifact to GitHub

## Update Process

Updates to Tachyon can be a combination of the CloudFormation template and a change in the JavaScript code-base. In either case, the CloudFormation stack should be updated with the latest template and the latest build of the code base.

Download the latest version of Tachyon from the GitHub releases page, and upload it to your S3 bucket you used when creating the initial Tachyon stack. It's recommended to use the pattern `tachyon-vx.x.x.zip` in the S3 path name to not overwrite old versions which allows rollbacks.

Update the CloudFormation Tachyon stack with the latest CloudFormation template from this repository, and specify the S3 path to the latest Tachyon version ZIP file.

## Credits
Created by Human Made for high volume and large-scale sites, such as [Happytables](http://happytables.com/). We run Tachyon on sites with millions of monthly page views, and thousands of sites.

Written and maintained by [Joe Hoyle](https://github.com/joehoyle).

Tachyon is inspired by Photon by Automattic. As Tachyon is not an all-purpose image resizer, rather it uses a media library in Amazon S3, it has a different use case to [Photon](https://jetpack.com/support/photon/).

Tachyon uses the [Sharp](https://github.com/lovell/sharp) (Used under the license Apache License 2.0) Node.js library for the resizing operations, which in turn uses the great libvips library.

Interested in joining in on the fun? [Join us, and become human!](https://hmn.md/is/hiring/)
