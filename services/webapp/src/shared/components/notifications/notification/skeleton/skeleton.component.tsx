import LoadingSkeleton from 'react-loading-skeleton';
import { useIntl } from 'react-intl';
import { forwardRef } from 'react';
import { Container, Content, Avatar, Title } from './skeleton.styles';

export const Skeleton = forwardRef<HTMLLIElement, Record<string, unknown>>((_, ref) => {
  const intl = useIntl();

  return (
    <Container
      ref={ref}
      role="status"
      aria-label={intl.formatMessage({
        id: 'Notifications / Notification / Loading ARIA label',
        defaultMessage: 'Loading notification',
      })}
    >
      <Avatar>
        <LoadingSkeleton circle={true} height={25} width={25} />
      </Avatar>
      <Title>
        <LoadingSkeleton height={8} width={60} />
        <LoadingSkeleton height={12} width={90} />
      </Title>
      <Content>
        <LoadingSkeleton height={50} width="90%" />
      </Content>
    </Container>
  );
});
