import { configureStore, createReducer } from '@reduxjs/toolkit';
import { fetchVersions, fetchServices } from './actions';

const INITIAL_STATE = {
    envs: [],
    services: {},
}

const versionsReducer = createReducer(INITIAL_STATE, {
    [fetchServices.fulfilled]: (state, action) => {
        state.services[action.meta.arg.envName] = action.payload;
    },
    [fetchVersions.fulfilled]: (state, action) => {
        state.envs = action.payload;
    }
});

const store = configureStore({
    reducer: {
        versions: versionsReducer
    },
})

export default store;
