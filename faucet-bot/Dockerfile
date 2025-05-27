FROM node:alpine
WORKDIR /HashCraft
COPY . /HashCraft
RUN npm i
ENTRYPOINT ["node", "--env-file=../.env ."]