ARG SB_MIRROR_REPOSITORY=''
ARG SB_PULL_THROUGH_CACHE_REPOSITORY=''
##
# Chamber installation stage
##

FROM ${SB_MIRROR_REPOSITORY}segment/chamber:2 AS chamber

##
# App build stage
##
FROM ${SB_PULL_THROUGH_CACHE_REPOSITORY}python:3.11-slim-bullseye AS backend_build

ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR off


RUN apt-get update && apt-get install -y gcc postgresql-client ca-certificates jq curl \
  && update-ca-certificates \
  && pip install --upgrade pip \
  && pip install --no-cache-dir setuptools pdm~=2.5.2 awscli==1.32.24


RUN curl -fsS https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get --no-install-recommends install -y nodejs

COPY --from=chamber /chamber /bin/chamber

WORKDIR /pkgs

COPY pdm.lock pyproject.toml pdm.toml /pkgs/
RUN pdm sync \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app/

RUN chmod +x /app/scripts/runtime/*.sh

FROM backend_build AS static_files
ENV HASHID_FIELD_SALT='' \
    DJANGO_PARENT_HOST='' \
    DJANGO_SECRET_KEY='build' \
    DB_CONNECTION='{"dbname":"build","username":"build","password":"build","host":"db","port":5432}' \
    REDIS_CONNECTION=redis://redis:6379 \
    WORKERS_EVENT_BUS_NAME='' \
    PYTHONPATH=/pkgs/__pypackages__/3.11/lib

RUN ./scripts/runtime/build_static.sh


FROM backend_build AS backend
COPY --from=static_files /app/static /app/static
ENV PYTHONPATH=/pkgs/__pypackages__/3.11/lib \
    PATH=$PATH:/pkgs/__pypackages__/3.11/bin

CMD ["./scripts/runtime/run.sh"]
