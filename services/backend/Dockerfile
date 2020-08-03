##
# Chamber installation stage
##

FROM segment/chamber:2 AS chamber

##
# App build stage
##

FROM python:3.8-slim-buster AS backend_build

ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR off


RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client ca-certificates jq \
  && update-ca-certificates \
  && pip install --no-cache-dir setuptools pipenv==2018.11.26 gunicorn awscli \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

COPY --from=chamber /chamber /bin/chamber

WORKDIR /app
COPY Pipfile* /app/

RUN pipenv install --dev --system --deploy

COPY . /app/
RUN chmod +x /app/scripts/*.sh


FROM backend_build AS static_files
ENV HASHID_FIELD_SALT='' \
    DJANGO_PARENT_HOST='' \
    DJANGO_SECRET_KEY='build' \
    DB_CONNECTION='{"dbname":"build","username":"build","password":"build","host":"db","port":5432}' \
    WORKERS_EVENT_BUS_NAME=''

RUN python manage.py collectstatic --no-input


FROM backend_build AS backend
COPY --from=static_files /app/static /app/static

CMD ["./scripts/run.sh"]

##
# SSH Bastion stage
##
FROM backend_build AS ssh_bastion

RUN apt-get update && apt-get install -y openssh-server

CMD ["./scripts/run-ssh-bastion.sh"]
