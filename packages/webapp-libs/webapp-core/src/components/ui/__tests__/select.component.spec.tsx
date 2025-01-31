import { fireEvent, screen } from '@testing-library/react';

import { MockPointerEvent } from '../../../tests/mocks/pointerEvent';
import { render } from '../../../tests/utils/rendering';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

const placeholderText = 'Select';
const option1Text = 'Option 1';
const option2Text = 'Option 2';

const oldPointerEvent = window.PointerEvent;

const Component = () => (
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder={placeholderText} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="opt1">{option1Text}</SelectItem>
      <SelectItem value="opt2">{option2Text}</SelectItem>
      <SelectItem value="opt3">Option 3</SelectItem>
    </SelectContent>
  </Select>
);

describe('UI/Select', () => {
  beforeEach(() => {
    window.PointerEvent = MockPointerEvent as any;
  });

  afterEach(() => {
    window.PointerEvent = oldPointerEvent;
  });

  it('should render select trigger button', async () => {
    render(<Component />);

    expect(screen.getByText(placeholderText)).toBeInTheDocument();
    expect(screen.queryByText(option1Text)).not.toBeInTheDocument();
  });

  it('should render select content after click', async () => {
    render(<Component />);

    fireEvent.pointerDown(screen.getByText(placeholderText));
    expect(await screen.findByText(option1Text)).toBeInTheDocument();
  });
});
