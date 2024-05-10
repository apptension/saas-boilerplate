import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { Form, FormField, FormItem, FormLabel, FormMessage } from '../';
import { render } from '../../../../tests/utils/rendering';

describe('Form: component', () => {
  type MockedForm = {
    label: string;
  };

  const Component = () => {
    const form = useForm<MockedForm>();

    return (
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  };

  it('Should render form with "Label" label', async () => {
    render(<Component />);

    expect(await screen.findByText('Label')).toBeInTheDocument();
  });
});
