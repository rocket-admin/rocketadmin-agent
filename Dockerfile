FROM node:14-alpine
WORKDIR /app
COPY package.json yarn.lock nest-cli.json /app/
RUN yarn install --network-timeout 1000000
COPY . /app
RUN yarn run nest build
CMD [ "./node_modules/.bin/nest", "start"]
