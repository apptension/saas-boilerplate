import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { CrudDemoItemList, CrudDemoItemListProps } from '../crudDemoItemList.component';
import { crudDemoItemFactory } from '../../../../mocks/factories';
import { prepareState } from '../../../../mocks/store';

const items = [crudDemoItemFactory({ name: 'first item' }), crudDemoItemFactory({ name: 'second item' })];

const store = prepareState((state) => {
  state.crudDemoItem.items = items;
});

describe('CrudDemoItemList: Component', () => {
  const defaultProps: CrudDemoItemListProps = {};

  const component = (props: Partial<CrudDemoItemListProps>) => <CrudDemoItemList {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render all items', () => {
    render({}, { store });
    expect(screen.getByText('first item')).toBeInTheDocument();
    expect(screen.getByText('second item')).toBeInTheDocument();
  });

  it('should render link to add new item form', () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history } });
    userEvent.click(screen.getByText(/add/gi));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/add');
  });
});
