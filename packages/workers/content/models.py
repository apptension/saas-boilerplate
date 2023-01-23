from sqlalchemy import Column, String, JSON, Boolean


class ContentfulModelMixin:
    id = Column(String(64), primary_key=True)
    fields = Column(JSON(), default={})
    is_published = Column(Boolean(), default=False)
