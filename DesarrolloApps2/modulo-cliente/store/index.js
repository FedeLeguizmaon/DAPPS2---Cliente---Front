import { createStore } from 'redux';
import rootReducer from './reducers'; // Importa el rootReducer directamente

const store = createStore(rootReducer);

export default store;