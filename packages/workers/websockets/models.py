from dao.db import models
from sqlalchemy import Column, ForeignKey, String, Integer, JSON
from sqlalchemy.orm import relationship

from userauth.models import User


class WebSocketConnection(models.Base):
    __tablename__ = "websockets_websocketconnection"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    user_id = Column(ForeignKey("users_user.id"))
    user = relationship(User)
    connection_id = Column("connection_id", String)


class GraphQLSubscription(models.Base):
    __tablename__ = "websockets_graphqlsubscription"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    connection_id = Column(ForeignKey("websockets_websocketconnection.id"))
    connection = relationship(WebSocketConnection)
    relay_id = Column("relay_id", String)
    operation_name = Column("operation_name", String)
    query = Column("query", String)
    variables = Column("variables", JSON)
