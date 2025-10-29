import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const cartActions = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case cartActions.ADD_TO_CART: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity }];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
    }

    case cartActions.REMOVE_FROM_CART: {
      const newItems = state.items.filter(item => item.id !== action.payload.productId);
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
    }

    case cartActions.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, { type: cartActions.REMOVE_FROM_CART, payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
    }

    case cartActions.CLEAR_CART:
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    case cartActions.LOAD_CART:
      return action.payload;

    default:
      return state;
  }
}

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// Cart Provider Component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('homemarket_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: cartActions.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('homemarket_cart', JSON.stringify(state));
  }, [state]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: cartActions.ADD_TO_CART,
      payload: { product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: cartActions.REMOVE_FROM_CART,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: cartActions.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART });
  };

  const getCartItem = (productId) => {
    return state.items.find(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Calculate shipping estimate (mock)
  const getShippingEstimate = () => {
    if (state.totalPrice >= 150000) return 0; // Free shipping
    return Math.min(state.totalPrice * 0.05, 25000); // 5% or max 25k
  };

  // Calculate taxes estimate (mock - 19% IVA in Colombia)
  const getTaxEstimate = () => {
    return Math.round(state.totalPrice * 0.19);
  };

  const value = {
    // State
    cart: state,
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,

    // Calculations
    shippingEstimate: getShippingEstimate(),
    taxEstimate: getTaxEstimate(),
    finalTotal: state.totalPrice + getShippingEstimate() + getTaxEstimate()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
