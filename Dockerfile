# stage 1 

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./ 
COPY package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# stage 2 

FROM nginx:stable-alpine

RUN touch /var/run/nginx.pid && \
chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
