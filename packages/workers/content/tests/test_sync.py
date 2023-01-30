import pytest
from sqlalchemy.orm import Session

from dao.db.models import Base
from .. import models, services


class MockContentfulItem(models.ContentfulModelMixin, Base):
    __tablename__ = 'content_mockcontentfulitem'
    __table_args__ = {'extend_existing': True}


@pytest.mark.usefixtures('db_session')
class TestContentfulSync:
    @pytest.fixture()
    def contentful_sync(self, contentful_client, db_session):
        return services.ContentfulSync(contentful_client(), db_session)

    @pytest.fixture()
    def entry_factory(self, mocker):
        ContentType = mocker.patch('contentful.ContentType')
        mock_item_content_type = ContentType()
        mock_item_content_type.id = 'mockContentfulItem'

        Entry = mocker.patch('contentful.Entry')

        def factory(entry_id: str):
            entry = Entry()
            entry.id = entry_id
            entry.sys = {'id': entry_id}
            entry.content_type = mock_item_content_type
            entry.fields.return_value = {'title': 'Some title', 'description': 'Some description'}
            return entry

        return factory

    def test_create_item_db_instance(self, contentful_sync, db_session, entry_factory):
        entry_id = 'mock-entry-1'
        entry = entry_factory(entry_id)
        contentful_sync.client.content_types.return_value = [entry.content_type]
        contentful_sync.client.entries.side_effect = [[entry], []]

        contentful_sync.sync()

        entry_instance = db_session.get(MockContentfulItem, entry_id)
        assert entry_instance.fields == entry.fields()
        assert entry_instance.is_published

    def test_unknown_items_marked_as_unpublished(self, contentful_sync, db_session: Session, entry_factory):
        old_entry_id = 'old-entry-1'
        db_session.add(MockContentfulItem(id=old_entry_id, fields={}, is_published=True))
        db_session.commit()

        entry_id = 'mock-entry-1'
        entry = entry_factory(entry_id)
        contentful_sync.client.content_types.return_value = [entry.content_type]
        contentful_sync.client.entries.side_effect = [[entry], []]

        contentful_sync.sync()

        old_entry_instance = db_session.get(MockContentfulItem, old_entry_id)
        assert not old_entry_instance.is_published

        entry_instance = db_session.get(MockContentfulItem, entry_id)
        assert entry_instance.is_published
