FROM ubuntu:latest
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get update && apt-get -y install nodejs
CMD cd /build ; npm install
