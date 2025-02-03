import { act, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from '../../../tests/utils/rendering';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';

const triggerText = 'Trigger';
const contentText = 'Content';

const Component = () => (
  <Tooltip delayDuration={0}>
    <TooltipTrigger>{triggerText}</TooltipTrigger>
    <TooltipContent>{contentText}</TooltipContent>
  </Tooltip>
);

describe('UI/Tooltip', () => {
  it('should render Trigger element', async () => {
    render(<Component />);
    expect(screen.getByText(triggerText)).toBeInTheDocument();
    expect(screen.queryByText(contentText)).not.toBeInTheDocument();
  });

  it('should render Trigger and Content after hover', async () => {
    render(<Component />);
    const trigger = screen.getByText(triggerText);
    // fireEvent.mouseOver(trigger);
    act(() => {
      trigger.focus();
    });
    trigger.focus();
    // somehow the tooltip is rendering content twice
    await waitFor(() => expect(screen.getAllByText(contentText)).toHaveLength(2));
  });
});
