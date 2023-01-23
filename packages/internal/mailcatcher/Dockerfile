FROM dockage/alpine:3.15.4

ENV MAILCATCHER_VERSION=0.8.2

RUN apk --no-cache --update add build-base ruby ruby-dev ruby-json ruby-etc sqlite-dev \
    && gem install mailcatcher:${MAILCATCHER_VERSION} --no-document \
    && apk del --rdepends --purge build-base

EXPOSE 1025 1080

ENTRYPOINT ["mailcatcher", "--smtp-ip=0.0.0.0", "--http-ip=0.0.0.0", "--foreground"]
