FROM apptension/awsb-base

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY Pipfile* /app/
RUN pipenv install --dev --system --deploy

COPY . /app/
RUN chmod +x /app/scripts/*.sh

RUN mkdir -p /var/task/email/templates
COPY emails/templates /var/task/emails/templates

CMD /bin/sh '/app/scripts/run-local-trigger-server.sh'
