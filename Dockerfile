FROM node

WORKDIR /app

COPY package*.json .

RUN npm install

COPY /dist .

ARG DEFAULT_PORT=3000

ARG ENVIRONMENT=dev

ENV PORT=$DEFAULT_PORT

ENV NODE_ENV=$ENVIRONMENT

EXPOSE $PORT


CMD [ "node", "index.js" ]