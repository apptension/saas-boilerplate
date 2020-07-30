from sqlalchemy import MetaData
from sqlalchemy import create_engine
from sqlalchemy.engine import url

import settings

db_url = None
db = None
meta = None

if settings.DB_CONNECTION is not None:
    db_url = url.URL(
        **{
            'drivername': settings.DB_CONNECTION['engine'],
            'host': settings.DB_CONNECTION['host'],
            'port': settings.DB_CONNECTION['port'],
            'username': settings.DB_CONNECTION['username'],
            'password': settings.DB_CONNECTION['password'],
            'database': settings.DB_CONNECTION['dbname'],
        }
    )

    db = create_engine(db_url)
    meta = MetaData(db)
