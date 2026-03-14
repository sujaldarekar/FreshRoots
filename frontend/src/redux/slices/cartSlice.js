import { createSlice } from '@reduxjs/toolkit';

const normalizeCartItem = (item) => {
  const parsedQty = Number(item?.cartQuantity ?? item?.cartQty ?? 1);
  const quantity = Number(item?.quantity ?? 0);
  const price = Number(item?.price ?? 0);

  return {
    ...item,
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    cartQuantity: Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1,
  };
};

const loadCart = () => {
  try {
    const stored = localStorage.getItem('freshroots_cart');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCartItem);
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem('freshroots_cart', JSON.stringify(items));
  } catch { /* ignore */ }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const normalizedProduct = normalizeCartItem(product);
      const existingIndex = state.items.findIndex((item) => item._id === product._id);
      if (existingIndex !== -1) {
        const newQty = state.items[existingIndex].cartQuantity + Number(quantity || 1);
        state.items[existingIndex].cartQuantity = Math.min(newQty, normalizedProduct.quantity);
      } else {
        state.items.push({
          ...normalizedProduct,
          cartQuantity: Math.min(Number(quantity || 1), normalizedProduct.quantity),
        });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) {
        item.cartQuantity = Math.max(1, Math.min(quantity, item.quantity));
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('freshroots_cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = Number(item?.price ?? 0);
    const qty = Number(item?.cartQuantity ?? item?.cartQty ?? 1);
    return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 1);
  }, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => {
    const qty = Number(item?.cartQuantity ?? item?.cartQty ?? 1);
    return sum + (Number.isFinite(qty) ? qty : 1);
  }, 0);
export const selectCartItemCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
