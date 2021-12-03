FROM public.ecr.aws/lambda/nodejs:14
COPY node_modules/ /var/task/node_modules
COPY server.js /var/task/
COPY index.js /var/task
COPY proxy-file.js /var/task

ARG AWS_REGION
ARG AWS_S3_BUCKET
ARG AWS_S3_ENDPOINT
ARG PORT

# Start the reactor
EXPOSE ${PORT:-8080}
ENTRYPOINT /var/lang/bin/node server.js ${PORT:-8080}
