import { screen } from '@testing-library/react';
import { empty } from 'ramda';
import { render } from '../../../../../tests/utils/rendering';
import { RadioButton, RadioButtonProps } from '../radioButton.component';

describe('RadioButton: Component', () => {
  const defaultProps: RadioButtonProps = { children: 'label' };

  const Component = (props: Partial<RadioButtonProps>) => {
    return <RadioButton {...defaultProps} {...props} />;
  };

  it('should render with correct label', () => {
    render(<Component />);
    expect(screen.getByLabelText('label')).toBeInTheDocument();
  });

  it('should pass props to input element', () => {
    render(<Component checked onChange={empty} />);
    expect(screen.getByRole('radio')).toHaveAttribute('checked');
  });
});
