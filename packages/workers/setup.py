import json
from distutils.core import setup, Command

from dotenv import load_dotenv
from environs import Env
from sqlalchemy import create_engine, exc
from sqlalchemy import text
from sqlalchemy.engine import url


def create_test_database():
    env = Env()
    DB_CONNECTION = json.loads(env('DB_CONNECTION'))
    db_url_params = {
        'drivername': DB_CONNECTION['engine'],
        'host': DB_CONNECTION['host'],
        'port': DB_CONNECTION['port'],
        'username': DB_CONNECTION['username'],
        'password': DB_CONNECTION['password'],
        'database': DB_CONNECTION['conndbname'],
    }

    template_engine = create_engine(
        url.URL.create(**db_url_params),
        echo=False,
    )

    conn = template_engine.connect()

    conn = conn.execution_options(autocommit=False)
    conn.execute(text("ROLLBACK"))
    try:
        conn.execute(text(f"DROP DATABASE {DB_CONNECTION['dbname']}"))
    except exc.ProgrammingError:
        # Could not drop the database, probably does not exist
        conn.execute(text("ROLLBACK"))
    except exc.OperationalError:
        # Could not drop database because it's being accessed by other users (psql prompt open?)
        conn.execute(text("ROLLBACK"))

    conn.execute(text(f"CREATE DATABASE {DB_CONNECTION['dbname']}"))
    conn.close()

    template_engine.dispose()


class CreateTestDB(Command):
    user_options = []

    def initialize_options(self):
        """Defined as noop since this method must be implemented by all command classes."""

    def finalize_options(self):
        """Defined as noop since this method must be implemented by all command classes."""

    def run(self):
        load_dotenv(dotenv_path='.env.test', override=True)
        create_test_database()


setup(cmdclass={'create_db': CreateTestDB})
