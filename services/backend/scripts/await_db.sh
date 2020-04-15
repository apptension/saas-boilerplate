#!/bin/sh

set -e

echo "AWAITING!"

DB_NAME=$(echo $DB_CONNECTION | jq '.dbname' -r)
DB_HOST=$(echo $DB_CONNECTION | jq '.host' -r)
DB_USER=$(echo $DB_CONNECTION | jq '.username' -r)
DB_PASSWORD=$(echo $DB_CONNECTION | jq '.password' -r)
DB_PORT=$(echo $DB_CONNECTION | jq '.port' -r)


postgres_ready() {
    python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME",
                           user="$DB_USER",
                           password="$DB_PASSWORD",
                           host="$DB_HOST",
                           port="$DB_PORT"
                           )
except psycopg2.OperationalError as e:
    print(e)
    sys.exit(-1)
sys.exit(0)
END
}

until postgres_ready; do
    >&2 echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done

>&2 echo "PostgreSQL is up - continuing..."

