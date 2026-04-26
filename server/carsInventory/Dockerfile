FROM node:18.12.1-bullseye-slim

RUN npm install -g npm@9.1.3

WORKDIR /app

COPY package.json .
COPY app.js .
COPY inventory.js .
COPY data/car_records.json ./data/

RUN npm install

COPY . .

EXPOSE 3050

CMD [ "node", "app.js" ]
