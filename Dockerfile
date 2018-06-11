FROM node:slim
MAINTAINER Robert O\'Rourke "rob@hmn.md"

# Install libvips
RUN [ "apt-get", "update", "--fix-missing" ]
RUN [ "apt-get", "install", "-y", "g++", "make", "python", "--no-install-recommends" ]

# Get app
COPY . /srv/tachyon/
WORKDIR /srv/tachyon
RUN [ "npm", "install" ]

# Enable env vars
ARG AWS_REGION
ARG AWS_S3_BUCKET

# Start the reactor
EXPOSE 8080
CMD [ "node", "server.js" ]