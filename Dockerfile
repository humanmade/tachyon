FROM mhart/alpine-node:4.8.2
RUN apk add vips-dev --update-cache --repository http://wjordan-apk.s3.amazonaws.com/ --allow-untrusted
RUN apk update && apk add vips build-base python
CMD cd /build ; npm install
