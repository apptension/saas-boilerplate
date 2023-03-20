import { identity } from 'ramda';
import { useMemo } from 'react';

import { ConnectionType, mapConnection } from '../../utils/graphql';

export const useMappedConnection = <ITEM>(data?: ConnectionType<ITEM>) =>
  useMemo(() => mapConnection(identity, data), [data]);
