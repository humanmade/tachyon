FROM lambci/lambda:nodejs10.x
COPY node_modules/ /var/task/node_modules
COPY server.js /var/task/
COPY index.js /var/task

ARG AWS_REGION
ARG AWS_S3_BUCKET
ARG AWS_S3_ENDPOINT
ARG PORT

# Start the reactor
EXPOSE ${PORT:-8080}
ENTRYPOINT /var/lang/bin/node server.js ${PORT:-8080}
