import pytest
from pytest_factoryboy import register
from sqlalchemy import exc, create_engine
from sqlalchemy.engine import url

import settings
from dao.db import connection
from dao.db.models import Base
from dao.db.session import db_session as db_session_ctx
from userauth import factories as ua_factories

register(ua_factories.UserFactory)


@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    template_engine = create_engine(url.URL(**{
        'drivername': settings.DB_CONNECTION['engine'],
        'host': settings.DB_CONNECTION['host'],
        'port': settings.DB_CONNECTION['port'],
        'username': settings.DB_CONNECTION['username'],
        'password': settings.DB_CONNECTION['password'],
        'database': settings.DB_CONNECTION['dbname']
    }), echo=False)

    conn = template_engine.connect()
    conn = conn.execution_options(autocommit=False)
    conn.execute("ROLLBACK")
    try:
        conn.execute(f"DROP DATABASE {settings.DB_CONNECTION['dbname']}_test")
    except exc.ProgrammingError:
        # Could not drop the database, probably does not exist
        conn.execute("ROLLBACK")
    except exc.OperationalError:
        # Could not drop database because it's being accessed by other users (psql prompt open?)
        conn.execute("ROLLBACK")

    conn.execute(f"CREATE DATABASE {settings.DB_CONNECTION['dbname']}_test")
    conn.close()

    template_engine.dispose()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(connection.db)

    with db_session_ctx() as session:
        yield session

    Base.metadata.drop_all(bind=connection.db)
