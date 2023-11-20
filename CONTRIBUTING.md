# Contributing

## Building

You'll need to [install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) as AWS SAM is used to build the ZIP and text the fixtures.

```
npm install
npm run build // Builds the function for use in SAM
npm run test // Invoke a function via SAM using a fixture from ./events/
```


