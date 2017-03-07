FROM node:6.9

# Install system packages
RUN apt-get update && apt-get install -y \
    ruby-dev \
    ruby \
    ruby-ffi \
    make && \
    rm -rf /var/lib/apt/lists/*

# Install Ruby-based tools
RUN gem update --system && gem install compass

# Install global tools
RUN npm install -g grunt grunt-cli
RUN npm install -g bower

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
RUN bower install --allow-root

EXPOSE 9000

CMD [ "grunt", "serve" ]