FROM node:lts-alpine

RUN npm install pnpm -g && npm cache clean -force

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

CMD pnpm run prod
