FROM node:6.9-slim

# Install global tools
RUN npm install --silent -g grunt grunt-cli bower

RUN apt-get update && \
    apt-get install -y ruby-clamp ruby-ffi git bzip2 ruby-compass && \
    apt-get clean

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --silent

COPY . /usr/src/app
RUN bower install --allow-root

EXPOSE 9000

ENTRYPOINT [ "grunt", "serve", "--force" ]