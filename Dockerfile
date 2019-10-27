FROM nginx

ARG API_HOST

RUN apt-get -y update
RUN apt-get -y install apt-utils build-essential python wget
RUN wget -qO- https://deb.nodesource.com/setup_12.x > node_setup.sh
RUN bash node_setup.sh
RUN apt-get -y install nodejs

RUN mkdir /app
COPY package*.json /app/
RUN cd /app && npm ci
COPY . /app
RUN cd /app && API_HOST=$API_HOST npm run build
RUN mv /app/dist/* /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html

