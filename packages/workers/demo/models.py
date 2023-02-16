from dao.db import models
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class CrudDemoItem(models.Base):
    __tablename__ = "demo_cruddemoitem"

    id = Column("id", Integer, primary_key=True, autoincrement=True)

    created_by = relationship("User", back_populates="cruddemoitem_set", foreign_keys='CrudDemoItem.created_by_id')
    created_by_id = Column(ForeignKey("users_user.id"), nullable=True)

    name = Column("name", String)


class DocumentDemoItem(models.Base):
    __tablename__ = "demo_documentdemoitem"

    id = Column("id", Integer, primary_key=True, autoincrement=True)

    created_by = relationship("User", back_populates="documents", foreign_keys='DocumentDemoItem.created_by_id')
    created_by_id = Column(ForeignKey("users_user.id"), nullable=True)

    file = Column("file", String)
    created_at = Column("created_at", DateTime)
