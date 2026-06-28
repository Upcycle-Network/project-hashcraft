FROM node:alpine
WORKDIR /bot
COPY . /bot
RUN npm i
ENTRYPOINT ["node","--env-file=.env", "."]