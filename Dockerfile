FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY files /
RUN mkdir -p /var/www/html/public
RUN chmod -R 755 /var/www/html/public
