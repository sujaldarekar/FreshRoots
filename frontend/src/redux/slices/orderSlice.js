import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await orderAPI.getMyOrders();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchFarmerOrders = createAsyncThunk(
  'orders/fetchFarmer',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await orderAPI.getFarmerOrders();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await orderAPI.create(orderData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, orderId, status }, { rejectWithValue }) => {
    try {
      const resolvedId = id || orderId;
      if (!resolvedId) {
        return rejectWithValue('Order id is required');
      }

      const { data } = await orderAPI.updateStatus(resolvedId, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    farmerOrders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => { state.currentOrder = null; },
    clearOrderError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFarmerOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farmerOrders = action.payload;
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const idx = state.farmerOrders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.farmerOrders[idx] = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;
export const selectMyOrders = (state) => state.orders.myOrders;
export const selectFarmerOrders = (state) => state.orders.farmerOrders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export default orderSlice.reducer;
