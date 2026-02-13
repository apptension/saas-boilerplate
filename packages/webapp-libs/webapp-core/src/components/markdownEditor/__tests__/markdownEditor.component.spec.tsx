import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { MarkdownEditor } from '../markdownEditor.component';

describe('MarkdownEditor: Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  const Component = (props: Partial<typeof defaultProps>) => (
    <MarkdownEditor {...defaultProps} {...props} />
  );

  it('should render textarea', async () => {
    render(<Component />);
    expect(await screen.findByRole('textbox')).toBeInTheDocument();
  });

  it('should display value in textarea', async () => {
    render(<Component value="Hello world" />);
    expect(await screen.findByDisplayValue('Hello world')).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const onChange = jest.fn();
    render(<Component onChange={onChange} />);
    const textarea = await screen.findByRole('textbox');
    await userEvent.type(textarea, 'test');
    expect(onChange).toHaveBeenCalled();
  });

  it('should toggle preview mode', async () => {
    render(<Component value="# Heading" />);
    const buttons = await screen.findAllByRole('button');
    const previewButton = buttons[buttons.length - 1];
    await userEvent.click(previewButton);
    expect(screen.getByText('Heading')).toBeInTheDocument();
  });

  it('should render placeholder when provided', async () => {
    render(<Component placeholder="Enter text..." />);
    expect(await screen.findByPlaceholderText('Enter text...')).toBeInTheDocument();
  });
});
