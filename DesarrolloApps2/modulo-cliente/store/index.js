import { createStore } from 'redux';
import { combineReducers } from 'redux';
import authReducer from './reducers/authReducer.js';
import cartReducer from './reducers/cartReducer.js';
// Importa otros reducers

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  // ... otros reducers
});
const store = createStore(rootReducer);

export default store;