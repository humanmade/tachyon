---
title: Plugin Setup
project: tachyon
permalink: '/projects/tachyon/plugin/'
---

The Tachyon plugin is responsible for replacing WordPress' default thumbnail handling with dynamic Tachyon URLs.

<a class="Btn Btn-Small" href="https://github.com/humanmade/tachyon-plugin">Download from GitHub</a>

# Installation

Install the Tachyon plugin as a regular plugin in your WordPress install (mu-plugins also supported).

You also need to point the plugin to your [Tachyon server](../server/). Add the following to your `wp-config-local.php`:

```php
define( 'TACHYON_URL', 'http://localhost:8080/<bucket name>/uploads' );
```

# Credits

The Tachyon plugin is based on the Photon plugin code by Automattic, part of [Jetpack](https://github.com/Automattic/jetpack/blob/master/class.photon.php). Used under the GPL.
