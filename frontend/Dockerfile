# build frontend
FROM node:lts-alpine

WORKDIR /app

RUN npm install pnpm -g

COPY ./package.json ./pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

# 基础镜像
FROM nginx:alpine

WORKDIR /app

RUN apk update \
    && apk add --no-cache tzdata \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait

# 将Nginx配置文件复制到镜像中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将本地的html、css、js等静态资源复制到镜像中
COPY --from=0 /app/dist .

RUN chmod +x /wait

# 启动Nginx服务
CMD /wait \
    # && sed -i "s/web_port/${WEB_PORT:-80}/" /etc/nginx/conf.d/default.conf \
    && sed -i "s/api_port/${API_PORT:-80}/" /etc/nginx/conf.d/default.conf \
    && nginx -g 'daemon off;'