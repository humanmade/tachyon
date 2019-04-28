# Contributing

## Release Process

1. Create and push a new tag following the convention `vx.x.x`
1. Build a new ZIP file by running `npm run build-docker && npm run build-node-modules && npm run build-zip`
1. Publish a new GitHub release, uploading `lambda.zip` as the built artifact to GitHub
