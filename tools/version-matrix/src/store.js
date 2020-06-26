import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = (state = [], action) => {
    if (action.type === 'VERSIONS_RECEIVED') {
        return action.versions;
    }

    return state;
}

const store = createStore(combineReducers({
    versions: rootReducer
}), applyMiddleware(thunk));

export default store;
