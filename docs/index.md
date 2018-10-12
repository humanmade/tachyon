---
title: Tachyon
project: tachyon
---

Tachyon is a faster than light image resizing service that runs on AWS. Super simple to set up, highly available and very performant.

Tachyon is built with some strong opinions and assumptions:

- Runs on AWS (using CloudFront, Lambda and API Gateway.)
- Expects original image files to be stored on Amazon S3.
- Only supports simple image resizing, not a full image manipulation service.

Tachyon works best with WordPress, coupled with [S3 Uploads](https://github.com/humanmade/s3-uploads) and the [Tachyon Plugin](https://github.com/humanmade/tachyon-plugin).

<img src="/projects/tachyon/diagram.png" style="max-width: 100%" />

Tachyon only supports serving from S3 buckets you own, on servers you're running. For other use cases, consider [Photon][] or [Imgix](https://imgix.com/).


## Why Tachyon?

Tachyon aims at doing one thing well: serving images from S3. It allows resizing those images, cropping, and changing the image quality, but is not intended to be an all-in-one image manipulation server. This keeps the code lightweight and fast.

Tachyon is entirely self-hosted, and relies on AWS infrastructure. This allows you to manage scale as you need, as well as control the cache.


## Setup

Tachyon comes in two parts: the [server to serve images](server/), and the [plugin to use it](plugin/). To use Tachyon, you need to run at least one server, as well as the plugin on all sites you want to use it.

The server is also available as a [Docker image](docker/), which can be used in production or to set up a local test environment.


## Credits

Created by Human Made for high volume and large-scale sites, such as [Happytables](http://happytables.com/). We run Tachyon on sites with millions of monthly page views, and thousands of sites.

Written and maintained by [Joe Hoyle](https://github.com/joehoyle).

Tachyon is inspired by Photon by Automattic. As Tachyon is not an all-purpose image resizer, rather it uses a media library in Amazon S3, it has a different use case to [Photon](https://jetpack.com/support/photon/).

Tachyon uses the [Sharp](https://github.com/lovell/sharp) library for resizing operations, which in turn uses the great libvips library. Used under the Apache License 2.0.

[Photon]: https://developer.wordpress.com/docs/photon/
