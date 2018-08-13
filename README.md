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

Tachyon works best with WordPress, coupled with [S3 Uploads](github.com/humanmade/s3-uploads) and the [Tachyon Plugin](https://github.com/humanmade/tachyon-plugin).

![](https://engineering.hmn.md/projects/tachyon/diagram.png)

---

## Installing

Tachyon is simple to install, just use the `cloudformation-template.json` in this repository to create the whole stack using AWS CloudFormation. It will ask you for a few details along the way.

You'll need to upload the latest release to Amazon S3 and put the location in the to the CloudFormation stack configuration.

## Using

Tachyon provides a simple HTTP interface in the form of:

`https://{tachyon-domain}/my/image/path/on/s3.png?w=100&h=80`

It's really that simple!

#### Args Reference

| URL Arg | Type | Description |
|---|----|---|
|`w`|Number|Max width of the image.|
|`h`|Number|Max height of the image.|
|`quality`|Number, 0-100|Image quality.|
|`resize`|String, "w,h"|A comma separated string of the target width and height in pixels. Crops the image.|
|`crop_strategy`|String, "smart", "entropy", "attention"|There are 3 automatic cropping strategies for use with `resize`: <ul><li>`attention`: good results, ~70% slower</li><li>`entropy`: mediocre results, ~30% slower</li><li>`smart`: best results, ~50% slower</li>|
|`gravity`|String|Alternative to `crop_strategy`. Crops are made from the center of the image by default, passing one of "north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest" or "center" will crop from that edge.|
|`fit`|String, "w,h"|A comma separated string of the target maximum width and height. Does not crop the image.|
|`crop`|Boolean\|String, "x,y,w,h"|Crop an image by percentages x-offset, y-offset, width and height (x,y,w,h). Percentages are used so that you don’t need to recalculate the cropping when transforming the image in other ways such as resizing it. You can crop by pixel values too by appending `px` to the values. `crop=160px,160px,788px,788px` takes a 788 by 788 pixel square starting at 160 by 160.|
|`zoom`|Number|Zooms the image by the specified amount for high DPI displays. `zoom=2` produces an image twice the size specified in `w`, `h`, `fit` or `resize`. The quality is automatically reduced to keep file sizes roughly equivalent to the non-zoomed image unless the `quality` argument is passed.|
|`webp`|Boolean, 1|Force WebP format.|
|`lb`|String, "w,h"|Add letterboxing effect to images, by scaling them to width, height while maintaining the aspect ratio and filling the rest with black or `background`.|
|`background`|String|Add background color via name (red) or hex value (%23ff0000). Don't forget to escape # as `%23`.|

For more details checkout the [docs](https://engineering.hmn.md/projects/tachyon/).

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
