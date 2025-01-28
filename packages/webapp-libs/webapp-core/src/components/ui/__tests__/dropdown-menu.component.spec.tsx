import { fireEvent, screen } from '@testing-library/react';

import { MockPointerEvent } from '../../../tests/mocks/pointerEvent';
import { render } from '../../../tests/utils/rendering';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu';

const triggerText = 'Trigger';
const labelText = 'Label';
const submenuTriggerText = 'Sub menu trigger';
const submenuItemText = 'Submenu item';

const oldPointerEvent = window.PointerEvent;

const Component = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>{triggerText}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>{labelText}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Menu item
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{submenuTriggerText}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>{submenuItemText}</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe('UI/DropdownMenu', () => {
  beforeEach(() => {
    window.PointerEvent = MockPointerEvent as any;
  });

  afterEach(() => {
    window.PointerEvent = oldPointerEvent;
  });

  it('should render dropdownMenu button', async () => {
    render(<Component />);

    expect(screen.getByText(triggerText)).toBeInTheDocument();
    expect(screen.queryByText(labelText)).not.toBeInTheDocument();
  });

  it('should render dropdownMenu content after click', async () => {
    render(<Component />);

    fireEvent.pointerDown(screen.getByText(triggerText));
    expect(await screen.findByText(labelText)).toBeInTheDocument();
  });

  it('should render submenu content after click', async () => {
    render(<Component />);

    fireEvent.pointerDown(screen.getByText(triggerText), { button: 0, ctrlKey: false });
    expect(await screen.findByText(labelText)).toBeInTheDocument();

    fireEvent.pointerMove(screen.getByText(submenuTriggerText));
    expect(await screen.findByText(submenuItemText)).toBeInTheDocument();
  });
});
