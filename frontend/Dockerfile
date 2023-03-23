# build frontend
FROM node:lts-alpine AS frontend

RUN npm install pnpm -g

WORKDIR /app

COPY ./package.json /app

COPY ./pnpm-lock.yaml /app

RUN pnpm install

COPY . /app

RUN pnpm run build

# 基础镜像
FROM nginx:latest

# 将本地的html、css、js等静态资源复制到镜像中
COPY --from=frontend /app/dist /usr/share/nginx/html

# 将Nginx配置文件复制到镜像中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]