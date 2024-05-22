import { Column, Container, Hr, Row, Section, Text } from '@react-email/components';
import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type ExportedUserDataResult = { email: string; export_url: string };
export type UserExportAdminProps = EmailComponentProps & {
  data: Array<ExportedUserDataResult>;
};

export const Template = ({ data }: UserExportAdminProps) => {
  return (
    <Layout
      title={<FormattedMessage defaultMessage="Exported user data" id="Email / User Export Admin / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Below are results of user export job. Each user received separate email with the download link."
          id="Email / User Export Admin / Text"
        />
      }
    >
      <Container className="w-screen">
        {data.map((row, index) => (
          <Section>
            <Row key={row.email} className="">
              <Column className="w-full">
                <Text className="font-custom">{row.email}</Text>
              </Column>

              <Column>
                <Button linkTo={row.export_url}>
                  <FormattedMessage defaultMessage="Download" id="Email / User Export Admin / Download" />
                </Button>
              </Column>
            </Row>
            {index + 1 < data.length && <Hr className="m-0" />}
          </Section>
        ))}
      </Container>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Exported user data" id="Email / User Export Admin / Subject" />
);
