import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { Container, Content, Avatar, Title } from './skeleton.styles';

type SkeletonProps = {
  $ref?: (node: Element | null) => void;
};

export const Skeleton = ({ $ref }: SkeletonProps) => {
  return (
    <Container ref={$ref}>
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
};
