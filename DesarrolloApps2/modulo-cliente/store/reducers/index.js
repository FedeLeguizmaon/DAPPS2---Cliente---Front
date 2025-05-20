import { combineReducers } from 'redux';
import authReducer from './authReducer';
import cartReducer from './cartReducer';
// Importa otros reducers

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  // ... otros reducers
});

export default rootReducer;