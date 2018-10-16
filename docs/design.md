# Design

## Why Tachyon?

Tachyon aims at doing one thing well: serving images from S3. It allows resizing those images, cropping, and changing the image quality, but is not intended to be an all-in-one image manipulation server. This keeps the code lightweight and fast.

Tachyon is entirely self-hosted, and relies on AWS infrastructure. This allows you to manage scale as you need, as well as control the cache.


## Assumptions

Tachyon is built with some strong opinions and assumptions:

- Runs on AWS (using CloudFront, Lambda and API Gateway.)
- Expects original image files to be stored on Amazon S3.
- Only supports simple image resizing, not a full image manipulation service.


## Limitations

Tachyon only supports serving from S3 buckets you own, on servers you're running. For other use cases, consider [Photon](https://developer.wordpress.com/docs/photon/) or [Imgix](https://imgix.com/).
