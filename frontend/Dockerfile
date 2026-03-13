FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm i -g serve

COPY . .

RUN npx vite build

EXPOSE 3000

CMD [ "serve", "-s", "dist", "--host" ]