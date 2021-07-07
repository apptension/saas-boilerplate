import LoadingSkeleton from 'react-loading-skeleton';
import { Container } from './skeleton.styles';

export const Skeleton = () => {
  return (
    <Container>
      <LoadingSkeleton height={14} width={50} />
      <LoadingSkeleton height={30} width={30} />
      <LoadingSkeleton height={16} width={120} />
      <LoadingSkeleton height={16} width={60} />
    </Container>
  );
};
