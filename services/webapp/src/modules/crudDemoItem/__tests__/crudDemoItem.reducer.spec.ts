import { reducer, INITIAL_STATE as defaultState } from '../crudDemoItem.reducer';
import { crudDemoItemFactory } from '../../../mocks/factories';
import { crudDemoItemActions } from '../index';
import { prepareState } from '../../../mocks/store';

const items = [crudDemoItemFactory(), crudDemoItemFactory(), crudDemoItemFactory()];

describe('CrudDemoItem: reducer', () => {
  it('should return initial state', () => {
    const action = { type: 'unknown-action' };
    const resultState = reducer(undefined, action);
    expect(resultState).toEqual(defaultState);
  });

  it('should return state on unknown action', () => {
    const action = { type: 'unknown-action' };
    const resultState = reducer(defaultState, action);
    expect(resultState).toEqual(defaultState);
  });

  describe('fetchCrudDemoItem', () => {
    it('should save fetched items to store', () => {
      const action = crudDemoItemActions.fetchCrudDemoItemList.resolved(items);
      const resultState = reducer(defaultState, action);
      expect(resultState).toEqual({
        ...defaultState,
        items,
      });
    });
  });

  describe('fetchCrudDemoItem', () => {
    it('should save fetched item to store', () => {
      const initialState = prepareState((state) => {
        state.crudDemoItem.items = [items[0], items[1]];
      }).crudDemoItem;

      const action = crudDemoItemActions.fetchCrudDemoItem.resolved(items[2]);
      const resultState = reducer(initialState, action);
      expect(resultState).toEqual({
        ...initialState,
        items,
      });
    });

    it('should not add fetched item to store if already is there', () => {
      const initialState = prepareState((state) => {
        state.crudDemoItem.items = items;
      }).crudDemoItem;

      const action = crudDemoItemActions.fetchCrudDemoItem.resolved(items[2]);
      const resultState = reducer(initialState, action);
      expect(resultState).toEqual(initialState);
    });
  });

  describe('deleteCrudDemoItem', () => {
    it('should delete item from store', () => {
      const initialState = prepareState((state) => {
        state.crudDemoItem.items = items;
      }).crudDemoItem;

      const action = crudDemoItemActions.deleteCrudDemoItem(items[1].id);
      const resultState = reducer(initialState, action);
      expect(resultState).toEqual({
        ...initialState,
        items: [items[0], items[2]],
      });
    });
  });
});
