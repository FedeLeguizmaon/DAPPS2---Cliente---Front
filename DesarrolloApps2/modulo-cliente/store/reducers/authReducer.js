import { LOGIN_SUCCESS, LOGOUT } from '../actions/authActions';

const initialState = {
  user: null,
  isAuthenticated: false,
  // ... otros estados relacionados con la autenticación
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export default authReducer;