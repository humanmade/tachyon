Node Tachyon
============

A local Tachyon server to help with development of the main plugin and app:

[WordPress plugin](https://github.com/humanmade/tachyon-plugin)

[Tachyon app](https://github.com/humanmade/tachyon)

## Installation

Make sure you have libvips installed, the easiest way is to use homebrew:

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
node server.js
```

You should see the server running by default on http://localhost:8080

## Usage

With the Tachyon plugin installe and active on your local environment add this to your `wp-config-local.php` file:

```php
define( 'TACHYON_URL', 'http://localhost:8080/<bucket name>/uploads' );
```

**NOTE:** Currently the region is hardcoded so you don't need the `hmn-uploads-eu-central` part
