from typing import List

from sqlalchemy.orm import relationship, Mapped
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey

from dao.db import models
from demo.models import CrudDemoItem, DocumentDemoItem


class User(models.Base):
    __tablename__ = "users_user"

    id = Column("id", Integer, primary_key=True, autoincrement=True)

    password = Column("password", String)
    email = Column("email", String)
    is_superuser = Column("is_superuser", Boolean, default=False)
    is_active = Column("is_active", Boolean, default=True)
    is_confirmed = Column("is_confirmed", Boolean, default=True)
    created = Column("created", DateTime)

    profile: Mapped["UserProfile"] = relationship(back_populates="user")
    cruddemoitem_set: Mapped[List["CrudDemoItem"]] = relationship(back_populates="created_by")
    documents: Mapped[List["DocumentDemoItem"]] = relationship(back_populates="created_by")

    def __str__(self):
        return self.email


class UserProfile(models.Base):
    __tablename__ = "users_userprofile"

    id = Column("id", Integer, primary_key=True, autoincrement=True)

    user: Mapped["User"] = relationship(User, back_populates="profile", foreign_keys='UserProfile.user_id')
    user_id = Column(ForeignKey("users_user.id"))

    first_name = Column("first_name", String)
    last_name = Column("last_name", String)

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.user.email
