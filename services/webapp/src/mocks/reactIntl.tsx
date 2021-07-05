import { UnknownObject } from '../shared/utils/types';

const mockReactIntl = jest.requireActual('react-intl');
const { FormattedMessage, useIntl } = mockReactIntl;

const mockFormattedMessage = (props: UnknownObject) => <FormattedMessage id="mock-message-id" {...props} />;
const useMockedIntl = () => {
  const { formatMessage, ...other } = useIntl();

  return {
    ...other,
    formatMessage: (params: any, values: any) => {
      return formatMessage({ ...params, id: 'mock-message-id' }, values);
    },
  };
};

jest.mock('react-intl', () => ({
  ...mockReactIntl,
  useIntl: useMockedIntl,
  FormattedMessage: mockFormattedMessage,
}));
