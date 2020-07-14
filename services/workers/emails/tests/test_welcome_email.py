import settings
from .. import handlers


def test_send_welcome_email(mocker, ses_client):
    ses_send_email = mocker.patch.object(ses_client, 'send_email', autospec=True)
    mocker.patch('emails.sender.get_ses_client', return_value=ses_client)

    event = {'to': 'bilbo@example.com', 'name': 'Bilbo Baggins', 'type': 'WelcomeEmail'}
    handlers.send_email(event, {})

    ses_send_email.assert_called_once()

    kwargs = ses_send_email.call_args.kwargs

    assert kwargs['Source'] == settings.FROM_EMAIL
    assert kwargs['Destination']['ToAddresses'] == [event['to']]
    assert event['name'] in kwargs['Message']['Body']['Html']['Data']
