FROM node:25.4-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8040

CMD npm run build && npm run start
