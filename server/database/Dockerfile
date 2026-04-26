FROM node:18.12.1-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3030

CMD [ "node", "app.js" ]
