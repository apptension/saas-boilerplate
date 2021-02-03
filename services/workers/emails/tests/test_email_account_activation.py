import settings
from .. import handlers


def test_send_account_activation_email(mocker, ses_client):
    ses_send_email = mocker.patch.object(ses_client, 'send_email', autospec=True)
    mocker.patch('emails.sender.get_ses_client', return_value=ses_client)
    mocker.patch('settings.WEB_APP_URL', return_value='https://example.org')

    event = {'to': 'bilbo@example.com', 'user_id': 'user-1', 'token': 'secret-token', 'type': 'account_activation'}
    handlers.send_email(event, {})

    ses_send_email.assert_called_once()

    kwargs = ses_send_email.call_args.kwargs

    assert kwargs['Source'] == settings.FROM_EMAIL
    assert kwargs['Destination']['ToAddresses'] == [event['to']]
    assert 'https://example.org/en/auth/confirm/user-1/secret-token' in kwargs['Message']['Body']['Html']['Data']
