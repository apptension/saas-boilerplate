import * as PopoverPrimitive from '@radix-ui/react-popover';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

describe('UI/Popover: component', () => {
  const Component = (props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => (
    <Popover {...props}>
      <PopoverTrigger>Trigger</PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
  );

  it('Should be visible by default', async () => {
    render(<Component defaultOpen={true} />);

    expect(await screen.findByText('Content')).toBeInTheDocument();
  });

  it('Should be visible after click', async () => {
    render(<Component defaultOpen={false} />);

    await userEvent.click(await screen.findByText('Trigger'));

    expect(await screen.findByText('Content')).toBeInTheDocument();
  });
});
