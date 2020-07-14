from .. import handlers


def test_send_email_to_ses(mocker, ses_client):
    event = {'to': 'bilbo@example.com', 'name': 'Bilbo Baggins', 'type': 'WelcomeEmail'}

    send_quota = ses_client.get_send_quota()
    assert int(send_quota["SentLast24Hours"]) == 0

    handlers.send_email(event, {})

    send_quota = ses_client.get_send_quota()
    assert int(send_quota["SentLast24Hours"]) == 1
