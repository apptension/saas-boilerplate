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


RUN apt-get update && apt-get install -y gcc postgresql-client ca-certificates jq \
  && update-ca-certificates \
  && pip install --upgrade pip \
  && pip install --no-cache-dir setuptools pdm==2.1.1 gunicorn awscli


COPY --from=chamber /chamber /bin/chamber

WORKDIR /pkgs

COPY pdm.lock pyproject.toml .pdm.toml /pkgs/
RUN pdm sync \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app/


FROM backend_build AS static_files
ENV HASHID_FIELD_SALT='' \
    DJANGO_PARENT_HOST='' \
    DJANGO_SECRET_KEY='build' \
    DB_CONNECTION='{"dbname":"build","username":"build","password":"build","host":"db","port":5432}' \
    WORKERS_EVENT_BUS_NAME='' \
    PYTHONPATH=/pkgs/__pypackages__/3.8/lib

RUN ./scripts/build_static.sh


FROM backend_build AS backend
COPY --from=static_files /app/static /app/static
ENV PYTHONPATH=/pkgs/__pypackages__/3.8/lib \
    PATH=$PATH:/pkgs/__pypackages__/3.8/bin

CMD ["./scripts/run.sh"]
