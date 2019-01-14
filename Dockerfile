FROM nginx:1.15.8-alpine

RUN ls -la
# copy source codes to workspace dir
COPY dist /usr/share/nginx/html

EXPOSE 80
