import React from 'react';

import { generatePath } from 'react-router';
import { screen } from '@testing-library/dom';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';
import { crudDemoItemFactory } from '../../../../mocks/factories';
import { prepareState } from '../../../../mocks/store';
import { ROUTES } from '../../../app.constants';

const item = crudDemoItemFactory();
const items = [crudDemoItemFactory(), item, crudDemoItemFactory()];

const store = prepareState((state) => {
  state.crudDemoItem.items = items;
});

describe('CrudDemoItemDetails: Component', () => {
  const component = () => <CrudDemoItemDetails />;
  const render = makeContextRenderer(component);

  it('should render item details', () => {
    render(
      {},
      {
        store,
        router: {
          url: `/en${generatePath(ROUTES.crudDemoItem.details, { id: item.id })}`,
          routePath: `/:lang${ROUTES.crudDemoItem.details}`,
        },
      }
    );
    expect(screen.getByText(`${item.name}`)).toBeInTheDocument();
  });
});
