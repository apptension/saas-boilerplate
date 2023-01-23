import pytest


@pytest.fixture(scope="function", autouse=True)
def contentful_client(mocker):
    return mocker.patch('contentful.Client')
