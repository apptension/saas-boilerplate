import { configureStore } from '@reduxjs/toolkit';
import { fetchVersions, fetchServices } from './actions';

const INITIAL_STATE = {
    envs: [],
    services: {},
}

const versionsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case fetchVersions.fulfilled.toString():
            return {
                ...state,
                envs: action.payload,
            }
        case fetchServices.fulfilled.toString():
            return {
                ...state,
                services: {
                    ...state.services,
                    [action.meta.arg.envName]: action.payload
                }
            }
        default:
            return state;
    }
};

const store = configureStore({
    reducer: {
        versions: versionsReducer
    },
})

export default store;
