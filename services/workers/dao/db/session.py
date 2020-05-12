from contextlib import contextmanager
from typing import ContextManager

from sqlalchemy import orm

from .connection import db

Session = orm.scoped_session(orm.sessionmaker())


@contextmanager
def db_session() -> ContextManager[Session]:
    Session.configure(bind=db)

    session = Session()

    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
