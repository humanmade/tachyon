# Using Docker

Tachyon Docker is a docker image that runs the app in a container.

* [Download from GitHub →](https://github.com/humanmade/tachyon-docker)
* [View on Docker Hub →](https://hub.docker.com/r/humanmade/tachyon/)

# Installation

You'll need a server with docker engine installed. Vagrant has a convenience provider built in,
and you can also install the [Docker command line tools for OSX, Windows or Linux](https://www.docker.com/products/overview).

You can pull the image from hub.docker.com using the following:

```sh
docker pull humanmade/tachyon
```

Or if you prefer to build locally from a clone of the Github repository use the following from
the same folder as the `Dockerfile`:

```sh
docker build -t humanmade/tachyon
```


# Usage

To run Tachyon as a service simply run the container passing a few environment variables to it.
We recommend passing the `-d` flag to daemonize the container and keep it running.

```sh
docker run -d \
  --name tachyon \
  -e AWS_REGION=<region> \
  -e AWS_S3_BUCKET=<bucket> \
  humanmade/tachyon
```

By default the service will expose port `8080`. You can change this by passing the `-p` flag
to [`docker run`](https://docs.docker.com/engine/reference/run/) and map it to another port.


## Custom S3 endpoint

You can specify a custom S3 endpoint if you're running a tool like [fakeS3][] by passing
the `AWS_S3_ENDPOINT` environment variable to `docker run`.


# Vagrant

Tachyon Docker comes with a `Vagrantfile` you can use to spin up a [fakeS3][] server and Tachyon
server locally.

First install the vagrant hosts updater plugin if you don't have it:

```sh
vagrant plugin install vagrant-hostsupdater
```

From a clone of the Github repository run `vagrant up`. Once the machine is provisioned you'll have
the following servers running:

```txt
http://s3.srv         # fakeS3 server
http://tchyn.srv      # Tachyon server
```

You can configure the URLs and endpoints as well as add additional Tachyon servers by editing
the `config.yml` file in the cloned repository.


## Configuring WordPress

To configure WordPress to use the VM add the following to `wp-config.php` once you've
installed [S3 Uploads](https://github.com/humanmade/S3-Uploads).

```php
<?php
define( 'S3_UPLOADS_BUCKET_URL', 'http://s3.srv/local' );
define( 'S3_UPLOADS_BUCKET', 'local' );

// These can be any non falsy value
define( 'S3_UPLOADS_KEY', 'missing' );
define( 'S3_UPLOADS_SECRET', 'missing' );
define( 'S3_UPLOADS_REGION', 'eu-west-1' );
```

And add a small script to your mu-plugins folder:

```php
<?php
add_filter( 's3_uploads_s3_client_params', function( $params ) {
    $params['endpoint'] = 'http://s3.srv/';
    $params['path_style'] = true;
    //$params['debug'] = true; // Useful if things aren't working to double check IPs etc
    return $params;
} );
```

You can then install the [Tachyon plugin](plugin.md) and configure it:

```php
<?php
// Tachyon URL
define( 'TACHYON_URL', 'http://tchyn.srv/uploads' );
```


[fakeS3]: https://github.com/jubos/fake-s3
