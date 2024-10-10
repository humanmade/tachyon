FROM public.ecr.aws/lambda/nodejs:18
COPY package.json /var/task/
COPY package-lock.json /var/task/
RUN npm install --omit=dev
COPY dist /var/task/dist

# Set environment variables, backwards compat with Tachyon 2x.
ARG S3_REGION
ARG S3_BUCKET
ARG S3_ENDPOINT
ARG PORT

# Start the reactor
EXPOSE ${PORT:-8080}
ENTRYPOINT /var/lang/bin/node dist/server.js ${PORT:-8080}
