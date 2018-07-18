FROM ubuntu:latest
RUN apt-get update && apt-get install -y curl build-essential python2.7
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get update && apt-get -y install nodejs npm
RUN ln -sf /usr/bin/python2.7 /usr/bin/python
CMD cd /build ; npm install --production
