import React from 'react';
import * as ReactRedux from 'react-redux';
import { screen, fireEvent } from '@testing-library/react';
import { times } from 'ramda';

import { Users } from '..';
import { makeContextRenderer } from '../../../utils/testUtils';
import { prepareState } from '../../../../mocks/store';
import { userFactory } from '../../../../mocks/factories';

const dispatchSpy = jest.spyOn(ReactRedux, 'useDispatch');

describe('Users: Component', () => {
  const render = makeContextRenderer(() => <Users />);
  const users = times(() => userFactory(), 10);

  it('should render users', () => {
    const store = prepareState((defaultState) => {
      defaultState.users.users = users;
    });
    render({}, { store });

    users.map((user) => expect(screen.getByText(`${user.name} [${user.displayName}]`)).toBeInTheDocument());
  });

  it('should call dispatch on button click', () => {
    const mockDispatch = jest.fn();
    dispatchSpy.mockImplementation(() => mockDispatch);

    render();

    fireEvent.click(screen.getByRole('button'));

    expect(mockDispatch).toHaveBeenCalled();
  });
});
