# Plugin Setup

The Tachyon plugin is responsible for replacing WordPress' default thumbnail handling with dynamic Tachyon URLs.

[Download from GitHub →](https://github.com/humanmade/tachyon-plugin)


# Installation

Install the Tachyon plugin as a regular plugin in your WordPress install (mu-plugins also supported).

You also need to point the plugin to your [Tachyon server](server.md). Add the following to your `wp-config-local.php`:

```php
define( 'TACHYON_URL', 'http://localhost:8080/<bucket name>/uploads' );
```


# Credits

The Tachyon plugin is based on the Photon plugin code by Automattic, part of [Jetpack](https://github.com/Automattic/jetpack/blob/master/class.photon.php). Used under the GPL.
