import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchFarmerProducts = createAsyncThunk(
  'products/fetchFarmer',
  async (farmerId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const resolvedFarmerId = farmerId || state?.auth?.user?._id;

      if (!resolvedFarmerId) {
        return rejectWithValue('Farmer profile not found. Please login again.');
      }

      const { data } = await productAPI.getFarmerProducts(resolvedFarmerId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    farmerProducts: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      freshness: '',
      search: '',
    },
  },
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload || {};

      if (key) {
        state.filters[key] = value;
      } else {
        state.filters = { ...state.filters, ...action.payload };
      }
    },
    clearFilters: (state) => {
      state.filters = { category: '', minPrice: '', maxPrice: '', freshness: '', search: '' };
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFarmerProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFarmerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farmerProducts = action.payload;
      })
      .addCase(fetchFarmerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.farmerProducts = state.farmerProducts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilter, clearFilters, setSelectedProduct, clearProductError } = productSlice.actions;
export const selectProducts = (state) => state.products.items;
export const selectFarmerProducts = (state) => state.products.farmerProducts;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductFilters = (state) => state.products.filters;
export default productSlice.reducer;
