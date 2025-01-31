import { screen } from '@testing-library/react';
import { empty } from 'ramda';
import { useForm } from 'react-hook-form';

import { render } from '../../../../tests/utils/rendering';
import { Form, FormField } from '../../../forms';
import { RadioGroup } from '../../../ui/radio-group';
import { RadioButton, RadioButtonProps } from '../radioButton.component';

type FormValues = {
  field: string;
};

describe('RadioButton: Component', () => {
  const exampleValue = 'value';
  const defaultProps: Partial<RadioButtonProps> = { children: 'label' };

  const Component = (props: Partial<RadioButtonProps> & Partial<FormValues>) => {
    const { field, ...radioButtonProps } = props;
    const defaultValues: Partial<FormValues> = {
      field,
    };
    const form = useForm<FormValues>({
      defaultValues,
    });
    return (
      <Form {...form}>
        <FormField
          control={form.control}
          name="field"
          render={() => (
            <RadioGroup defaultValue={defaultValues.field}>
              <RadioButton value={exampleValue} {...defaultProps} {...radioButtonProps} />
              );
            </RadioGroup>
          )}
        />
      </Form>
    );
  };

  it('should render with correct label', async () => {
    render(<Component />);
    expect(await screen.findByLabelText('label')).toBeInTheDocument();
  });

  it('should pass props to input element', async () => {
    render(<Component onChange={empty} field={exampleValue} />);
    expect(await screen.findByRole('radio')).toHaveAttribute('data-state', 'checked');
  });
});
