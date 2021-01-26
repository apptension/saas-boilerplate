import { GlobalState } from '../../config/reducers';

export const selectStartupDomain = (state: GlobalState) => state.startup;
