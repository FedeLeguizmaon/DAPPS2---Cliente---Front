
// Tipos de acciones
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const UPDATE_CART_ITEM_QUANTITY = 'UPDATE_CART_ITEM_QUANTITY';
export const CLEAR_CART = 'CLEAR_CART';

// Creadores de acciones (action creators)
export const addToCart = (item) => {
  return {
    type: ADD_TO_CART,
    payload: item, // El ítem a agregar (debería tener al menos un 'id' y un 'quantity')
  };
};

export const removeFromCart = (itemId) => {
  return {
    type: REMOVE_FROM_CART,
    payload: itemId, // El ID del ítem a eliminar
  };
};

export const updateCartItemQuantity = (itemId, quantity) => {
  return {
    type: UPDATE_CART_ITEM_QUANTITY,
    payload: { itemId, quantity }, // ID del ítem y la nueva cantidad
  };
};

export const clearCart = () => {
  return {
    type: CLEAR_CART,
  };
};