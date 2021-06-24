import { useMemo } from 'react';
import { identity } from 'ramda';
import { ConnectionType, mapConnection } from '../../utils/graphql';

export const useMappedConnection = <ITEM>(data: ConnectionType<ITEM>) =>
  useMemo(() => mapConnection(identity, data), [data]);
