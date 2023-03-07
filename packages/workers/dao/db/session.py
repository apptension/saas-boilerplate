from contextlib import contextmanager
from typing import Generator

from sqlalchemy import orm

from .connection import db

Session = None

if db is not None:
    Session = orm.scoped_session(orm.sessionmaker())
    Session.configure(bind=db)


@contextmanager
def db_session() -> Generator[Session, None, None]:
    session = Session()

    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
