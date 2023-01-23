from . import models


def purge_connection(connection_id, session):
    connection = session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).first()
    if connection:
        session.query(models.GraphQLSubscription).filter_by(connection=connection).delete()
        session.delete(connection)
