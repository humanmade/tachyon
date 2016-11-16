Node Tachyon
============

A fast image processor to be used with the Tachyon [WordPress plugin](https://github.com/humanmade/tachyon-plugin). node-tachyon can either be run directly in NodeJS on your server, or also utilize AWS Lambda and act as a proxy to the Lambda function.


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

## Installation in Production

As Tachyon is meant for production use on AWS, we have a fully fledged CloudFormation template that is the easiest way to get a production ready instance of Tachyon.

The `cloudformation-template.json` in the root should be used to instantiate a new Stack in CloudFormation. You'll need to build and zip the Lambda function (see below) and place the zip on S3. Pass this ZIP location in the CloudFormation template parameters.

## Configuration

Populate the `config.json` with the AWS region and bucket name you want to us. In the following format:

```JSON
{
	"region": "eu-west-1",
	"bucket": "hmn-uploads-eu"
}
```

## Running the server

```
node server.js [port] [--debug]
```

With no options passed you should see the server running by default on http://localhost:8080

## Usage

With the Tachyon plugin installed and active on your local environment add this to your `wp-config-local.php` file:

```php
define( 'TACHYON_URL', 'http://localhost:8080/<bucket name>/uploads' );
```

**NOTE:** Currently the region is hardcoded so you don't need the `hmn-uploads-eu-central` part

## Lambda

Tachyon also supports using Lambda to offload the image processing task, meaning you don't need lots of hardware to handle thousands of image resize requests. Using lambda comes in two parts:

### Configuration

Populate the `config.json` with the AWS region and bucket name you want to us. In the following format:

```JSON
{
	"region": "eu-west-1",
	"bucket": "hmn-uploads-eu",
	"lambdaRegion": "eu-west-1",
	"lambdaFunction": "node-tachyon-test"
}
```

### NodeJS Lambda Proxy

Until AWS API Gateway can support returning binary data from Lambda functions, we need to proxy the requests for images to AWS Lambda, this is what the Lambda Proxy part of node-tachyon does. This is simple enough, just run:

```
node lambda-server.js [port] [--debug]
```

This will proxy all requests to the AWS Lambda function, and return the responses as images from the `lambda-server`, just as if you were using `server.js`.

Make sure you have access with credentials to call the AWS Lambda API function `invokeLambda`.

### Lambda Function

The second part of using Lambda is the AWS Lambda function it's self. You can create a function in AWS Lambda, and then upload a ZIP file for the code. To create the ZIP just create an archive of this repository (with npm modules installed), however we must exclude some things to make it smaller!

```
zip -r lambda ./ -x node_modules/aws-sdk -x .git/
```

Now, we just need to upload it to the Lambda function:

```
aws lambda update-function-code --function-name node-tachyon-test --zip-file fileb://path/to/zip
```

### Local testing without S3

If you want to test Tachyon using your local uploads directory, with the WordPress plugin:

```bash
git clone git@github.com:humanmade/node-tachyon.git ~/node-tachyon
cd ~/node-tachyon
npm install // See instructions above for other installations, e.g. OS X
cd /mysite/wp-content/
node ~/node-tachyon/local-server.js --debug
```

You should now be able to view images via `http://localhost:8080/uploads/2016/10/test.jpg` etc. Also, you should be able to apply resize params such as `http://localhost:8080/uploads/2016/10/test.jpg?w=100`.

Now we need to provide the details to the WordPress Tachyon Plugin, in your site's `wp-config.php` add the following configuration:

```php
define( 'TACHYON_URL', 'http://localhost:8080/uploads' );
```

Ofcourse, make sure you have the Tachyon WordPress Plugin activated.
