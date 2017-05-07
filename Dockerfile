FROM node:latest

RUN mkdir -p /home/pi/api.scambiolibri
WORKDIR /home/pi/api.scambiolibri

COPY package.json /home/pi/api.scambiolibri
RUN npm install

COPY . /home/pi/api.scambiolibri

EXPOSE 8181

RUN npm start
