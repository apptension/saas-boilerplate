from sqlalchemy import Column, String, Integer, Boolean, DateTime

from dao.db import models


class User(models.Base):
    __tablename__ = "users_user"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    password = Column("password", String)
    email = Column("email", String)
    is_superuser = Column("is_superuser", Boolean, default=False)
    is_active = Column("is_active", Boolean, default=True)
    is_confirmed = Column("is_confirmed", Boolean, default=True)
    created = Column("created", DateTime)
