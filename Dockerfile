FROM node:latest

WORKDIR /app

COPY . ./


RUN npm  install --only=production


CMD [ "npm", "start" ]

EXPOSE 3636