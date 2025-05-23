import { combineReducers } from 'redux';
import authReducer from './authReducer.js';
import cartReducer from './cartReducer.js';
// Importa otros reducers

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  // ... otros reducers
});

export default rootReducer;