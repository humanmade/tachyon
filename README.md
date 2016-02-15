Node Tachyon
============

A local [Tachyon](https://github.com/humanmade/tachyon) server to help with development of the WordPress plugin:

[WordPress plugin](https://github.com/humanmade/tachyon-plugin)

## Installation

If you're running on OSX make sure you have libvips installed, the easiest way is to use homebrew:

```
brew install homebrew/science/vips --with-webp --with-graphicsmagick
```

Clone and initialise the repo

```
git clone git@github.com:humanmade/node-tachyon.git
npm install
```

## Running the server

```
node server.js [port] [--debug]
```

With no options passed you should see the server running by default on http://localhost:8080

## Usage

With the Tachyon plugin installe and active on your local environment add this to your `wp-config-local.php` file:

```php
define( 'TACHYON_URL', 'http://localhost:8080/<bucket name>/uploads' );
```

**NOTE:** Currently the region is hardcoded so you don't need the `hmn-uploads-eu-central` part
