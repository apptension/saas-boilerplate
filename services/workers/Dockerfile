ARG BASE_IMAGE=python:3.8-slim-buster
FROM ${BASE_IMAGE}

RUN apt-get update && apt-get install -y wget gnupg curl unzip make xz-utils

RUN \
  echo "deb https://deb.nodesource.com/node_14.x buster main" > /etc/apt/sources.list.d/nodesource.list && \
  wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
  wget -qO- https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  apt-get update && \
  apt-get install -yqq nodejs yarn && \
  pip install -U pip==21.3.1 && pip install pdm==2.1.1 && \
  npm i -g npm@^6 && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /pkgs

COPY pdm.lock pyproject.toml .pdm.toml /pkgs/
RUN pdm sync

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app/
RUN chmod +x /app/scripts/*.sh

ENV PYTHONPATH=/pkgs/__pypackages__/3.8/lib \
    PATH=$PATH:/pkgs/__pypackages__/3.8/bin

CMD /bin/sh '/app/scripts/run-local-trigger-server.sh'
