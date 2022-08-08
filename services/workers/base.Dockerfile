FROM python:3.8-slim-buster

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

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
	unzip awscliv2.zip && \
	./aws/install --update && \
	rm awscliv2.zip

WORKDIR /pkgs

COPY pdm.lock pyproject.toml .pdm.toml /pkgs/
RUN pdm sync

WORKDIR /app

COPY package*.json /app/
RUN npm install
