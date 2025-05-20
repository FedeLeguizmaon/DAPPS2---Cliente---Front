
import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM_QUANTITY, CLEAR_CART } from '../actions/cartActions';

const initialState = {
  items: [],
  total: 0,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const addedItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === addedItem.id);

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (addedItem.quantity || 1),
        };
        return {
          ...state,
          items: updatedItems,
          total: state.total + (addedItem.price * (addedItem.quantity || 1)),
        };
      } else {
        const newItem = { ...addedItem, quantity: addedItem.quantity || 1 };
        return {
          ...state,
          items: state.items.concat(newItem),
          total: state.total + (newItem.price * newItem.quantity),
        };
      }

    case REMOVE_FROM_CART:
      const itemIdToRemove = action.payload;
      const itemToRemove = state.items.find(item => item.id === itemIdToRemove);
      const updatedItemsAfterRemove = state.items.filter(item => item.id !== itemIdToRemove);
      if (itemToRemove) {
        return {
          ...state,
          items: updatedItemsAfterRemove,
          total: state.total - (itemToRemove.price * itemToRemove.quantity),
        };
      }
      return state;

    case UPDATE_CART_ITEM_QUANTITY:
      const { itemId, quantity } = action.payload;
      const updatedItemsAfterQuantity = state.items.map(item =>
        item.id === itemId ? { ...item, quantity: parseInt(quantity, 10) } : item
      );
      return {
        ...state,
        items: updatedItemsAfterQuantity,
        total: updatedItemsAfterQuantity.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

    case CLEAR_CART:
      return {
        ...state,
        items: [],
        total: 0,
      };

    default:
      return state;
  }
};

export default cartReducer;