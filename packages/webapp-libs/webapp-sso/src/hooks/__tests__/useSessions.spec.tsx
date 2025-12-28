import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';

import { useSessions } from '../useSessions';
import {
  GET_SESSIONS,
  REVOKE_SESSION,
  REVOKE_ALL_SESSIONS,
} from '../../graphql/sessions.graphql';

const mockSession = {
  id: 'session-1',
  deviceName: 'Chrome on macOS',
  browser: 'Chrome',
  operatingSystem: 'macOS',
  ipAddress: '192.168.1.100',
  lastActivity: '2024-01-15T14:30:00Z',
  isActive: true,
  isCurrent: true,
  createdAt: '2024-01-15T08:00:00Z',
};

const mockSession2 = {
  id: 'session-2',
  deviceName: 'Safari on iOS',
  browser: 'Safari',
  operatingSystem: 'iOS',
  ipAddress: '192.168.1.101',
  lastActivity: '2024-01-15T12:00:00Z',
  isActive: true,
  isCurrent: false,
  createdAt: '2024-01-14T10:00:00Z',
};

const mockGetSessionsResponse: MockedResponse = {
  request: {
    query: GET_SESSIONS,
  },
  result: {
    data: {
      sessions: {
        edges: [
          { node: mockSession, cursor: 'cursor-1' },
          { node: mockSession2, cursor: 'cursor-2' },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor-2',
        },
      },
    },
  },
};

const wrapper = (mocks: MockedResponse[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useSessions', () => {
  it('should fetch active sessions', async () => {
    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([mockGetSessionsResponse]) }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.sessions[0].deviceName).toBe('Chrome on macOS');
  });

  it('should identify current session', async () => {
    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([mockGetSessionsResponse]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const currentSession = result.current.sessions.find(s => s.isCurrent);
    expect(currentSession).toBeDefined();
    expect(currentSession?.id).toBe('session-1');
  });

  it('should revoke a session', async () => {
    const revokeMock: MockedResponse = {
      request: {
        query: REVOKE_SESSION,
        variables: {
          input: { id: 'session-2' },
        },
      },
      result: {
        data: {
          revokeSession: {
            session: {
              ...mockSession2,
              isActive: false,
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([mockGetSessionsResponse, revokeMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.revokeSession).toBeDefined();
  });

  it('should revoke all other sessions', async () => {
    const revokeAllMock: MockedResponse = {
      request: {
        query: REVOKE_ALL_SESSIONS,
        variables: {
          input: { exceptCurrent: true },
        },
      },
      result: {
        data: {
          revokeAllSessions: {
            count: 1,
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([mockGetSessionsResponse, revokeAllMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.revokeAllSessions).toBeDefined();
  });

  it('should handle empty sessions list', async () => {
    const emptyResponse: MockedResponse = {
      request: {
        query: GET_SESSIONS,
      },
      result: {
        data: {
          sessions: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([emptyResponse]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toHaveLength(0);
  });

  it('should sort sessions by last activity', async () => {
    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([mockGetSessionsResponse]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Current session should be first
    expect(result.current.sessions[0].isCurrent).toBe(true);
  });

  it('should handle fetch error', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: GET_SESSIONS,
      },
      error: new Error('Failed to fetch sessions'),
    };

    const { result } = renderHook(
      () => useSessions(),
      { wrapper: wrapper([errorMock]) }
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.sessions).toEqual([]);
  });
});

