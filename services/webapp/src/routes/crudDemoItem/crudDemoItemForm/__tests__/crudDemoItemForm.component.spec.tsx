import React from 'react';

import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { CrudDemoItemForm, CrudDemoItemFormProps } from '../crudDemoItemForm.component';

describe('CrudDemoItemForm: Component', () => {
  const defaultProps: CrudDemoItemFormProps = {};

  const component = (props: Partial<CrudDemoItemFormProps>) => <CrudDemoItemForm {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
