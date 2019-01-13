FROM nginx:1.15.8-alpine


# copy source codes to workspace dir
COPY dist /usr/share/nginx/html

EXPOSE 80
