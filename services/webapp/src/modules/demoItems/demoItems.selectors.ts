import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../app/config/reducers';

export const selectDemoItemsDomain = (state: GlobalState) => state.demoItems;

export const selectFavoriteDemoItemIds = createSelector(selectDemoItemsDomain, (state) => state.favorites);
