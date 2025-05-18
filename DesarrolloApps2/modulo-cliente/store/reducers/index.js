import { combineReducers } from 'redux';
import authReducer from './authReducer';
// Importa otros reducers

const rootReducer = combineReducers({
  auth: authReducer,
  // ... otros reducers
});

export default rootReducer;