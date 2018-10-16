# Documentation

Tachyon is a faster than light image resizing service that runs on AWS. Super simple to set up, highly available and very performant.


## Setup

Tachyon comes in two parts: the [server to serve images](server.md), and the [plugin to use it](plugin.md). To use Tachyon, you need to run at least one server, as well as the plugin on all sites you want to use it.

The server is also available as a [Docker image](docker.md), which can be used in production or to set up a local test environment.


## Documentation

* [Design](design.md) - Motivation and Design
* [Server Setup](server.md) (or, [Docker Setup](docker.md))
	* [Installation on AWS](server.md#installation-on-aws)
	* [Manual Installation on Lambda](server.md#manual-installation-on-lambda)
	* [Manual Installation](server.md#manual-installation)
	* [Update Process](server.md#update-process)
* [Plugin Setup](plugin.md)
* [Using Tachyon](using.md)
* [Hints and Tips](tips.md)
