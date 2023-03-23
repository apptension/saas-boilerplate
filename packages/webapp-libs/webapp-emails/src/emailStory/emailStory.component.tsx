import axios from 'axios';
import { ReactNode, useState } from 'react';

import { EmailTemplateType } from '../types';
import { Container, Email, Header, RecipientInput, SendEmail, SendEmailButton, Subject } from './emailStory.styles';

type EmailStorybookProps = {
  children: ReactNode;
  type: EmailTemplateType;
  subject: ReactNode;
  emailData: Record<any, any>;
};

export const EmailStory = ({ children, subject, emailData, type }: EmailStorybookProps) => {
  const [recipient, setRecipient] = useState('yourmail@mail.com');

  const handleSendEmail = () => axios.post('/sendEmail', { recipient, type, data: emailData });

  return (
    <Container>
      <Header>
        <Subject>{subject}</Subject>
        <SendEmail>
          <div>
            <SendEmailButton onClick={handleSendEmail}>Send to: </SendEmailButton>
            <RecipientInput value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
        </SendEmail>
      </Header>
      <Email>{children}</Email>
    </Container>
  );
};
