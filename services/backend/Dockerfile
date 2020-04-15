##
# Chamber installation stage
##

FROM segment/chamber:2 AS chamber

##
# App build stage
##

FROM python:3.8-alpine AS backend

ENV PYTHONUNBUFFERED 1

RUN apk update \
  # psycopg2 dependencies
  && apk add --virtual build-deps gcc python3-dev musl-dev \
  && apk add postgresql-dev \
  && apk add build-base linux-headers pcre-dev \
  # Pillow dependencies
  && apk add jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev \
  # CFFI dependencies
  && apk add libffi-dev py-cffi \
  # https://docs.djangoproject.com/en/dev/ref/django-admin/#dbshell
  && apk add postgresql-client \
  && apk add libev libev-dev \
  && apk add jq \
  && apk add --no-cache ca-certificates wget \
  && apk add --no-cache bash git openssh

RUN update-ca-certificates

COPY --from=chamber /chamber /bin/chamber

RUN pip install -U pip==18.0 setuptools pipenv gunicorn

RUN set -x ; \
  addgroup -g 82 -S www-data ; \
  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1

RUN mkdir -p /app/
COPY Pipfile* /app/
WORKDIR /app/
RUN pipenv install --dev --system --deploy

COPY ./ /app
RUN chmod +x /app/scripts/*.sh

WORKDIR /app

ENV DB_CONNECTION='{}' \
    STRIPE_API_KEY_US='' \
    STRIPE_API_KEY_EU='' \
    STRIPE_PUBLIC_KEY_US='' \
    STRIPE_PUBLIC_KEY_EU='' \
    STRIPE_CLIENT_ID_US='' \
    STRIPE_CLIENT_ID_EU='' \
    STRIPE_FAILURE_NOTIFICATION_EMAILS='' \
    STRIPE_MONEY_TRANSFER_DELAY_IN_DAYS='' \
    TIMEKIT_API_KEY='' \
    HASH_ID_FIELD_SALT='' \
    TWILIO_ACCOUNT_SID='' \
    TWILIO_AUTH_TOKEN='' \
    TWILIO_API_KEY='' \
    TWILIO_API_SECRET='' \
    TWILIO_RECORDING_ENABLED='' \
    BOOKING_CANCELLATION_LOCK_IN_HOURS=24 \
    CONTENTFUL_SPACE_ID='' \
    CONTENTFUL_ACCESS_TOKEN='' \
    CONTENTFUL_ENVIRONMENT='' \
    DJANGO_PARENT_HOST=''

RUN python manage.py collectstatic --no-input

CMD /bin/chamber exec $CHAMBER_SERVICE_NAME -- sh /app/scripts/run.sh

##
# Nginx build stage
##

FROM nginx:1.17.1-alpine AS nginx

RUN  apk update \
  && apk add --no-cache ca-certificates wget \
  && update-ca-certificates

COPY --from=chamber /chamber /bin/chamber

RUN rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/log/nginx/healthd/ \
    && chown nginx:nginx /var/log/nginx/healthd/ \
    && mkdir -p /static/

COPY ./nginx /etc/nginx/
COPY --from=backend /app/static /static

RUN mkdir -p /scripts/
COPY ./scripts /scripts

CMD /bin/chamber exec $CHAMBER_SERVICE_NAME -- sh /scripts/run_nginx.sh
