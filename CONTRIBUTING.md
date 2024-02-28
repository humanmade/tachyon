# Contributing

## Building for Lambda

You'll need to [install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) as AWS SAM.

```
npm install
npm run build // Builds the function for use in SAM
```

### Building locally

Tachyon is written in TypeScript. All TypeScript files are in `.src` and running `npx tsc` will build everything to `./dist`. You can run `npx tsc -w` to watch for file changes to update `./dist`. This is needed if you are running the server locally (see below) or running the Lambda environment via the SAM cli (see below.)

### Running a server locally

Invoking the function via Lambda locally is somewhat slow (see below), in many cases you may want to start a local Node server which maps the Node request into a Lambda-like request. `./src/server.ts` exists for that reason. The local server will still connect to the S3 bucket (set with the `S3_BUCKET` env var) for files.


### Running Lambda Locally

Before testing any of the Lambda function calls via the `sam` CLI, you must run `sam build -u` to build the NPM deps via the Lambda docker container. This will also build the `./dist/` into the SAM environment, so any subsequent changes to files in `./src` but be first built (which updates `./dist`), and then `sam build -u` must be run.

To run Tachyon in a Lambda local environment via docker, use the `sam local invoke -e events/animated-gif.json` CLI command. This will call the function via the `src/lambda-handler.handler` function.

### Writing tests

Tests should be written using Jest. Files matching `./tests/**/test-*.ts` will automatically be included in the Jest testsuite. For tests, you don't need to run `npx tsc` to compile TypeScript files to `./dist`, as this is integrated automatically via the `ts-jest` package.

Run `npm test` to run the tests.
