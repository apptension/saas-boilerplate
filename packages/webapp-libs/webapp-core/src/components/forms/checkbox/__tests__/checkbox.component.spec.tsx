import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactNode } from 'react';

import { render } from '../../../../tests/utils/rendering';
import { Checkbox } from '../checkbox.component';

describe('Checkbox: Component', () => {
  const defaultProps = {
    label: 'Checkbox label',
  };

  const Component = (
    props: React.RefAttributes<HTMLButtonElement> & {
      label?: ReactNode;
      error?: string;
    }
  ) => <Checkbox {...defaultProps} {...props} />;

  it('should be unchecked by default', async () => {
    render(<Component />);
    expect(((await screen.findByRole('checkbox', { hidden: true })) as HTMLButtonElement).dataset['state']).toEqual(
      'unchecked'
    );
  });

  it('should be checked after clicking', async () => {
    render(<Component />);
    await userEvent.click(await screen.findByText('Checkbox label'));
    expect((screen.getByRole('checkbox', { hidden: true }) as HTMLButtonElement).dataset['state']).toEqual('checked');
  });

  it('should render provided error message', async () => {
    render(<Component error="Invalid value" />);
    expect(await screen.findByText('Invalid value')).toBeInTheDocument();
  });
});
