from graphene import Boolean, Field, Int, List, ObjectType, String
from graphene.relay import ConnectionField, Connection

from .helpers import convert_connection_args_to_page_options
from .pagination import create_page_cursors


class PageCursor(ObjectType):
    cursor = String()
    is_current = Boolean()
    page = Int()


class PageCursors(ObjectType):
    around = List(PageCursor)
    first = Field(PageCursor)
    last = Field(PageCursor)
    next = Field(PageCursor)
    previous = Field(PageCursor)


class UIPagedConnection(Connection):
    class Meta:
        abstract = True

    page_cursors = Field(PageCursors)


class UIPagedConnectionField(ConnectionField):
    @classmethod
    def resolve_connection(cls, _connection, args, iterable):
        connection = super(UIPagedConnectionField, cls).resolve_connection(_connection, args, iterable)

        page_options = convert_connection_args_to_page_options(args)
        page_cursors = create_page_cursors(page_options, len(iterable))
        connection.page_cursors = page_cursors

        return connection
