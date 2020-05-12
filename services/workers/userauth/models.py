from sqlalchemy import Column, String, Integer, Boolean, DateTime

from dao.db import models


class User(models.Base):
    __tablename__ = "userauth_user"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    password = Column("password", String)
    email = Column("email", String)
    username = Column("username", String)
    first_name = Column("first_name", String, default='')
    last_name = Column("last_name", String, default='')
    is_staff = Column("is_staff", Boolean, default=False)
    is_superuser = Column("is_superuser", Boolean, default=False)
    is_active = Column("is_active", Boolean, default=True)
    date_joined = Column("date_joined", DateTime)
