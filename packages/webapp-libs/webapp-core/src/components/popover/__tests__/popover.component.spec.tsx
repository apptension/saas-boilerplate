import * as PopoverPrimitive from '@radix-ui/react-popover';
import { screen } from '@testing-library/react';
import React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '../';
import { render } from '../../../tests/utils/rendering';

describe('Form: component', () => {
  const Component = (props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => (
    <Popover {...props}>
      <PopoverTrigger>Trigger</PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
  );

  it('Should be visible by default', async () => {
    render(<Component defaultOpen={true} />);

    expect(await screen.findByText('Trigger')).toBeInTheDocument();
  });
});
