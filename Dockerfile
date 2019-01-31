# 编译
FROM node:8.15
RUN mkdir /build
COPY ./ /build
WORKDIR /build
RUN rm -f /build/dist /build/node_modules
RUN npm i
RUN npm run build


# publish image
FROM nginx:1.15.8-alpine
# copy builded source files to workspace dir
COPY --from=0 /build/dist /usr/share/nginx/html

EXPOSE 80
