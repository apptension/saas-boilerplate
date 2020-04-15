#!/bin/sh

>&2 echo Configure nginx...

envsubst '${NGINX_SERVER_NAME} ${NGINX_BACKEND_HOST}' < /etc/nginx/conf.d/application.template > /etc/nginx/conf.d/application.conf

>&2 echo Starting nginx...

nginx -g 'daemon off;'
