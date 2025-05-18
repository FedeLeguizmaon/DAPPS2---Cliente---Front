import { createStore, combineReducers } from 'redux';
import authReducer from './reducers/authReducer';
// Importa otros reducers si los tienes

const rootReducer = combineReducers({
  auth: authReducer,
  // ... otros reducers
});

const store = createStore(rootReducer);

export default store;